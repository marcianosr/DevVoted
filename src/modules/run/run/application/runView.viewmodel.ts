import type { CategoryCode } from "~/shared/lib/categories";
import {
	type AnsweredPoll,
	type AnswerOutcome,
	type AnswerType,
	canRepairWidthDemand,
	canRunLinter,
	canStart,
	isAwaitingTomorrow,
	isRunOver,
	lintApplies,
	lintCost,
	type RunPoll,
	type RunState,
	type RunStatus,
} from "~/modules/run/run/domain/run.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import type { CheckStatus } from "~/modules/run/config/domain/effect.model";
import {
	EXTEND_FROM_GATE,
	extendCost,
	LOCK_COST_KB,
	LOCK_FROM_GATE,
	MAX_EXTENSIONS,
	MAX_LOCKED_OFFERS,
	offerCount,
	rebuildCost,
} from "~/modules/run/shop/domain/draft.model";
import {
	checkStatuses,
	gateDemands,
} from "~/modules/run/gate/domain/gate.model";
import {
	swatchForGate,
	type SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";
import {
	type CoverageConfigBonus,
	type PerAnswerPreview,
	type PipelineModifiers,
	coverageForAnswer,
	coverageToAddSlot,
	linterFor,
	perAnswerPreviewFor,
	pipelineModifiersFor,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	dropCount,
	isStoragePlanUnlocked,
	minConfigsForGate,
	pollDifficultyMultiplier,
	roundToOneDecimal,
	SLICE_WINDOW,
	storagePlanFor,
	storagePlanLadder,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";

type PollOptionView = { readonly id: string; readonly label: string };

/** One rung of the storage-plan ladder, as the shop row renders it. */
export type StoragePlanOption = {
	readonly tier: number;
	readonly capKb: number;
	readonly billKb: number;
	readonly current: boolean;
	/** KB sitting above this plan's cap that switching to it would burn on the spot. */
	readonly burnKb: number;
	/** Gates the run must clear before this rung is sold (ADR-030). */
	readonly fromGate: number;
	/** The one rung shown ahead of the run — visible, priced, not yet buyable. */
	readonly locked: boolean;
};

export type PollView = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly codeBlock?: string;
	readonly codeSandboxUrl?: string;
	readonly answerType: AnswerType;
	readonly options: readonly PollOptionView[];
};

export type RunView = {
	readonly status: RunStatus;
	readonly slots: number;
	readonly configs: readonly Config[];
	readonly available: readonly Config[];
	readonly draftOptions: readonly Config[];
	readonly newConfigIds: readonly string[];
	readonly stripsRemaining: number;
	readonly poll: PollView | null;
	readonly awaitingTomorrow: boolean;

	readonly pollsExhausted: boolean;
	readonly disabledOptionIds: readonly string[];
	readonly canLint: boolean;
	readonly lintReady: boolean;
	readonly lintCost: number;
	readonly linter: Config | null;
	readonly rebuildCost: number;
	readonly canRebuild: boolean;

	readonly lockAvailable: boolean;
	readonly lockCost: number;
	readonly canLock: boolean;
	readonly lockedOfferIds: readonly string[];
	readonly extendAvailable: boolean;
	readonly extendCost: number;
	readonly canExtend: boolean;
	readonly offerCount: number;
	readonly slotCoverageRequired: number;

	readonly unlock?: { readonly slot: number; readonly progress: number };
	readonly justUnlockedSlots: readonly number[];
	readonly checks: readonly CheckStatus[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	readonly allAnswered: readonly AnsweredPoll[];
	readonly passedChecks: readonly CheckStatus[];
	readonly demands: readonly string[];
	/** Kept whole rather than flattened: every screen that shows pricing wants all
	 * four at once, and a spread here means each one reassembles them by hand. */
	readonly modifiers: PipelineModifiers;
	readonly perAnswer: PerAnswerPreview;
	readonly canStart: boolean;
	readonly isOver: boolean;
	readonly gateRewardPaidKb: number;
	readonly faucetThisGateKb: number;
	readonly gatesCleared: number;

	readonly gateTheme?: SwatchTheme;

	readonly clearedGateNumber: number;
	readonly victoryGate: number;

	readonly stripsOnFailure: number;

	readonly minConfigs: number;
	readonly underMinConfigs: boolean;

	readonly widthRepairable: boolean;
	readonly pollsToGate: number;
	readonly pollsAnswered: number;
	readonly pollsPerGate: number;
	readonly streak: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly coverageGainedThisGate: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly storageCap: number;
	readonly storageBillKb: number;
	readonly gateBillPaidKb: number;
	readonly planDowngraded: boolean;
	readonly storagePlans: readonly StoragePlanOption[];
	readonly log: readonly string[];
};

type AnswerVerdict = {
	readonly outcome: AnswerOutcome;
	readonly correctAnswers: readonly string[];
};

const latestAnswerVerdict = (view: RunView): AnswerVerdict | null => {
	const last = view.answeredThisGate.at(-1);
	if (!last) return null;
	return { outcome: last.outcome, correctAnswers: last.correct ?? [] };
};

type AnswerDifficulty = {
	readonly multiplier: number;
	readonly optionCount: number;
	readonly isMultiple: boolean;
};

export type AnswerScore = {
	readonly isCorrect: boolean;
	readonly baseCoverage: number;
	readonly streakBonus: number;
	readonly configBonuses: readonly CoverageConfigBonus[];
	readonly earnedCoverage: number;
	readonly difficulty?: AnswerDifficulty;
};

const answerDifficulty = (
	answered: AnsweredPoll
): AnswerDifficulty | undefined => {
	const optionCount = answered.options?.length;
	if (optionCount === undefined) return undefined;
	const isMultiple = answered.answerType === "multiple";
	const multiplier = roundToOneDecimal(
		pollDifficultyMultiplier(optionCount, isMultiple)
	);
	if (multiplier <= 1) return undefined;
	return { multiplier, optionCount, isMultiple };
};

export const latestAnswerScore = (view: RunView): AnswerScore | null => {
	const answered = view.answeredThisGate.at(-1);
	const breakdown = answered?.coverageBreakdown;
	if (!answered || !breakdown) return null;
	const { base, streakBonus, configBonuses } = breakdown;
	const earnedCoverage = roundToOneDecimal(
		base +
			streakBonus +
			configBonuses.reduce((sum, bonus) => sum + bonus.value, 0)
	);
	return {
		isCorrect: base >= 0,
		baseCoverage: base,
		streakBonus,
		configBonuses,
		earnedCoverage,
		difficulty: answerDifficulty(answered),
	};
};

export const correctOptionIdsFor = (
	poll: PollView,
	answered: RunView
): readonly string[] => {
	const verdict = latestAnswerVerdict(answered);
	if (!verdict) return [];
	return poll.options
		.filter((option) => verdict.correctAnswers.includes(option.label))
		.map((option) => option.id);
};

const gainedThisGate = (state: RunState): Record<string, number> => {
	const gained: Record<string, number> = {};
	state.answeredThisGate.forEach((poll, index) => {
		const earned =
			poll.coverageEarned ??
			coverageForAnswer(
				state.pipeline.configs,
				{ category: poll.category, answeredBefore: index },
				poll.outcome === "correct" ? 1 : 0
			);
		if (earned > 0)
			gained[poll.category] = roundToOneDecimal(
				(gained[poll.category] ?? 0) + earned
			);
	});
	return gained;
};

const unlockOf = (
	state: RunState
): { slot: number; progress: number } | undefined => {
	const required = coverageToAddSlot(state.pipeline.slots);
	if (!Number.isFinite(required) || required <= 0) return undefined;
	return {
		slot: state.pipeline.slots + 1,
		progress: Math.min(1, state.coverage / required),
	};
};

const redactPoll = (poll: RunPoll): PollView => ({
	id: poll.id,
	category: poll.category,
	question: poll.question,
	codeBlock: poll.codeBlock,
	codeSandboxUrl: poll.codeSandboxUrl,
	answerType: poll.answerType,
	options: poll.options.map((option) => ({
		id: option.id,
		label: option.label,
	})),
});

export const toRunView = (state: RunState): RunView => {
	const current = state.polls[state.currentIndex];
	const nextRebuildCost = rebuildCost(state.rebuildsUsed);
	const nextLintCost = lintCost(state.manualDisabled.length);
	const plan = storagePlanFor(state.storagePlan);
	const locked = state.lockedOfferIds ?? [];
	const extensions = state.extensionsBought ?? 0;
	const nextExtendCost = extendCost(extensions);

	return {
		status: state.status,
		slots: state.pipeline.slots,
		configs: state.pipeline.configs,
		available: state.available,
		draftOptions: state.draftOptions,
		newConfigIds: state.draftedThisGate,
		stripsRemaining: state.stripsRemaining,
		poll: state.status === "answering" && current ? redactPoll(current) : null,
		awaitingTomorrow: isAwaitingTomorrow(state),
		pollsExhausted: state.currentIndex >= state.polls.length,
		// Only options the player paid to lint off — no automatic masking.
		disabledOptionIds: state.manualDisabled,
		canLint: lintApplies(state),
		lintReady: canRunLinter(state),
		lintCost: nextLintCost,
		rebuildCost: nextRebuildCost,
		canRebuild: state.storage >= nextRebuildCost,
		lockAvailable:
			state.gatesCleared >= LOCK_FROM_GATE && locked.length < MAX_LOCKED_OFFERS,
		lockCost: LOCK_COST_KB,
		canLock: state.storage >= LOCK_COST_KB,
		lockedOfferIds: locked,
		extendAvailable:
			state.gatesCleared >= EXTEND_FROM_GATE && extensions < MAX_EXTENSIONS,
		extendCost: nextExtendCost,
		canExtend: state.storage >= nextExtendCost,
		offerCount: offerCount(extensions),
		slotCoverageRequired: coverageToAddSlot(state.pipeline.slots),
		unlock: unlockOf(state),
		justUnlockedSlots: state.justUnlockedSlots ?? [],
		linter:
			current === undefined
				? null
				: (linterFor(state.pipeline.configs, current.category) ?? null),
		checks: checkStatuses(state.pipeline, state.window, state.gatesCleared),
		answeredThisGate: state.answeredThisGate,
		allAnswered: state.allAnswered ?? [],
		passedChecks: state.clearedChecks,
		demands: gateDemands(state.pipeline, state.gatesCleared),
		modifiers: pipelineModifiersFor(state.pipeline.configs),
		perAnswer: perAnswerPreviewFor(state.pipeline.configs, state.gatesCleared),
		canStart: canStart(state.pipeline),
		isOver: isRunOver(state.status),
		gateRewardPaidKb: state.gateRewardKb ?? 0,
		faucetThisGateKb: state.faucetThisGateKb ?? 0,
		gatesCleared: state.gatesCleared,
		gateTheme: swatchForGate(state.gatesCleared)?.theme,
		clearedGateNumber: state.clearedGate ?? state.gatesCleared,
		victoryGate: VICTORY_GATE,
		stripsOnFailure: dropCount(state.gatesCleared),
		minConfigs: minConfigsForGate(state.gatesCleared),
		underMinConfigs:
			state.pipeline.configs.length < minConfigsForGate(state.gatesCleared),
		widthRepairable: canRepairWidthDemand(state),
		pollsToGate: SLICE_WINDOW - state.window.answered,
		pollsAnswered: state.window.answered,
		pollsPerGate: SLICE_WINDOW,
		streak: state.streak,
		coverage: state.coverage,
		coverageByCategory: state.coverageByCategory,
		coverageGainedThisGate: gainedThisGate(state),
		storage: state.storage,
		storageCap: plan.capKb,
		storageBillKb: plan.billKb,
		gateBillPaidKb: state.gateBillKb ?? 0,
		planDowngraded: state.planDowngraded ?? false,
		storagePlans: storagePlanLadder(state.gatesCleared).map((option) => ({
			tier: option.tier,
			capKb: option.capKb,
			billKb: option.billKb,
			current: option.tier === plan.tier,
			burnKb: Math.max(0, state.storage - option.capKb),
			fromGate: option.fromGate,
			locked: !isStoragePlanUnlocked(option, state.gatesCleared),
		})),
		log: state.log,
	};
};

/** `stuck` is the explicit dead-end: leaving walks into the gate and ends the
 * run (ADR-031). */
export type ShopExit =
	| { readonly state: "open"; readonly gate: number }
	| {
			readonly state: "blocked";
			readonly gate: number;
			readonly demand: number;
			readonly shortfall: number;
	  }
	| { readonly state: "stuck"; readonly gate: number; readonly demand: number };

/**
 * The shop's one exit, graded against the coming gate's width demand
 * (ADR-031). Open while the build meets it; blocked — with the shortfall
 * measured — while the shop can still repair it; and once the run is provably
 * stuck (no affordable offer, no rebuild worth hoping for, or no free slot),
 * an explicit end-run click.
 *
 * The verdict carries numbers, not a label: the door reads the same everywhere
 * because every surface formats this one shape, and the wording is reachable
 * from a story rather than only from an engine state that produces it.
 */
export const shopExitFor = (
	view: Pick<
		RunView,
		| "gatesCleared"
		| "minConfigs"
		| "underMinConfigs"
		| "widthRepairable"
		| "configs"
	>
): ShopExit => {
	if (!view.underMinConfigs) return { state: "open", gate: view.gatesCleared };
	if (view.widthRepairable)
		return {
			state: "blocked",
			gate: view.gatesCleared,
			demand: view.minConfigs,
			shortfall: view.minConfigs - view.configs.length,
		};
	return {
		state: "stuck",
		gate: view.gatesCleared,
		demand: view.minConfigs,
	};
};

import type { CategoryCode } from "~/domains/shared/categories";
import {
	type AnsweredPoll,
	type AnswerOutcome,
	type AnswerType,
	canRunLinter,
	isAwaitingTomorrow,
	lintApplies,
	lintCost,
	rebuildCost,
	type RunPoll,
	type RunState,
	type RunStatus,
} from "../climb/run.model";
import type { Config } from "../configs/config.model";
import type { CheckStatus } from "../configs/effect.model";
import { checkStatuses, gateDemands } from "../gate/gate.model";
import { swatchForGate, type SwatchTheme } from "../gate/swatch.model";
import {
	canAddSlot,
	type CoverageConfigBonus,
	coverageForAnswer,
	coverageToAddSlot,
	linterFor,
	pipelineModifiersFor,
} from "../pipeline/pipeline.model";
import {
	aggregateStorageEffects,
	dropCount,
	pollDifficultyMultiplier,
	roundToOneDecimal,
	SLICE_WINDOW,
	STORAGE_CAP_KB,
	STORAGE_CONFIGS,
	VICTORY_GATE,
} from "../rules.model";

export type PollOptionView = { readonly id: string; readonly label: string };

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
	/** Daily lock (ADR-014): answering, but today's segment is spent. */
	readonly awaitingTomorrow: boolean;
	readonly disabledOptionIds: readonly string[];
	readonly canLint: boolean;
	readonly lintReady: boolean;
	readonly lintCost: number;
	readonly linter: Config | null;
	readonly rebuildCost: number;
	readonly canRebuild: boolean;
	readonly slotCoverageRequired: number;
	/**
	 * The unlock the run is currently paying for: the slot coverage is buying and
	 * how far it has come toward it (0–1). Undefined once the ladder is exhausted.
	 */
	readonly unlock?: { readonly slot: number; readonly progress: number };
	readonly canAddSlot: boolean;
	readonly checks: readonly CheckStatus[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	/** Every poll answered across the whole run — the end-of-run review source. */
	readonly allAnswered: readonly AnsweredPoll[];
	readonly passedChecks: readonly CheckStatus[];
	readonly demands: readonly string[];
	readonly rewardMultiplier: number;
	readonly coverageMultiplier: number;
	readonly coverageAdd: number;
	readonly gateReward: number;
	/** What the just-cleared gate actually paid — the reward/shop screens' number. */
	readonly gateRewardPaidKb: number;
	/** Exact (capped) faucet income collected this gate — feeds the reward report. */
	readonly faucetThisGateKb: number;
	readonly gatesCleared: number;
	/**
	 * The ambient theme of the gate being played (ADR-020): the whole app wears
	 * the swatch of the gate you're fighting for. Undefined past the last gate,
	 * falling back to the :root default.
	 */
	readonly gateTheme?: SwatchTheme;
	/**
	 * The gate the last clear beat — one behind `gatesCleared`, which that clear
	 * advanced. Old snapshots lack the source field; the fallback keeps their
	 * old behavior.
	 */
	readonly clearedGateNumber: number;
	readonly victoryGate: number;
	/**
	 * Configs a failed gate would peel at this depth. Surfaced because the quota
	 * outgrows a narrow pipeline (`dropCount`), so a window can be sudden death
	 * without the player being told.
	 */
	readonly stripsOnFailure: number;
	readonly pollsToGate: number;
	readonly pollsAnswered: number;
	readonly pollsPerGate: number;
	readonly streak: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly coverageGainedThisGate: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly storageCap: number;
	readonly ownedStorageConfigs: Readonly<Record<string, number>>;
	readonly availableStorageConfigs: ReadonlyArray<{
		readonly id: string;
		readonly label: string;
		readonly description: string;
		readonly currentLevel: number;
		readonly nextLevelCost: number | null;
		readonly maxLevel: boolean;
	}>;
	readonly draftCostReduction: number;
	readonly refundBoost: number;
	readonly payoutBoost: number;
	readonly freeRebuild: boolean;
	readonly log: readonly string[];
};

export type AnswerVerdict = {
	readonly outcome: AnswerOutcome;
	readonly correctAnswers: readonly string[];
};

/**
 * The verdict of the answer just submitted — the freshest entry in the gate's
 * answer log. Older snapshots may lack `correct`; the verdict then only
 * carries the outcome.
 */
export const latestAnswerVerdict = (view: RunView): AnswerVerdict | null => {
	const last = view.answeredThisGate.at(-1);
	if (!last) return null;
	return { outcome: last.outcome, correctAnswers: last.correct ?? [] };
};

/**
 * Ids of the answered poll's correct options, for the post-submit reveal.
 * `poll` is the poll as it was on screen (pre-advance view); `answered` is the
 * server response that recorded the answer. Labels bridge the two — the
 * redacted view strips per-option correctness, and the answer log only keeps
 * labels.
 */
/**
 * Why a hard poll's base was boosted, for the reveal's "correct" chip tooltip.
 * Present only when the poll earned more than the baseline (multiplier > 1) —
 * baseline polls have nothing to explain.
 */
export type AnswerDifficulty = {
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

/**
 * The difficulty bonus folded into the answered poll's base coverage, or
 * undefined for a baseline poll (3-option single-choice → ×1.0) or a snapshot
 * taken before option/type were recorded. Sourced from the answered poll, not
 * the live `poll`, which has already advanced to the next question at reveal.
 */
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

/**
 * The just-answered poll's coverage as the reveal's chip equation needs it:
 * base + streak + per-config, plus the summed total. Null for snapshots taken
 * before breakdowns existed. A miss reads as a negative base (the penalty).
 */
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
		// The engine records the actual earn per answer; recomputing (for
		// pre-coverageEarned snapshots) can't know partial shares, so it
		// falls back to full-or-nothing. The array index IS the window position,
		// so index 0 marks the opener for Cold Start's multiplier.
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

/**
 * The rung the run is paying for: the next slot and how far coverage has come
 * toward it. Undefined at the slot cap, where no rung is left to buy.
 */
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

	const effects = aggregateStorageEffects(state.ownedStorageConfigs);
	const storageCap = STORAGE_CAP_KB + (effects.capAddKb ?? 0);

	const availableStorageConfigs = STORAGE_CONFIGS.map((config) => {
		const currentLevel = state.ownedStorageConfigs[config.id] ?? 0;
		const isMaxed = currentLevel >= config.levelPrices.length;
		return {
			id: config.id,
			label: config.label,
			description: config.description,
			currentLevel,
			nextLevelCost: isMaxed ? null : config.levelPrices[currentLevel],
			maxLevel: isMaxed,
		};
	});

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
		// Only options the player paid to lint off — no automatic masking.
		disabledOptionIds: state.manualDisabled,
		canLint: lintApplies(state),
		lintReady: canRunLinter(state),
		lintCost: nextLintCost,
		rebuildCost: nextRebuildCost,
		canRebuild: state.storage >= nextRebuildCost,
		slotCoverageRequired: coverageToAddSlot(state.pipeline.slots),
		unlock: unlockOf(state),
		canAddSlot: canAddSlot(state.pipeline.slots, state.coverage),
		linter:
			current === undefined
				? null
				: (linterFor(state.pipeline.configs, current.category) ?? null),
		checks: checkStatuses(state.pipeline, state.window, state.gatesCleared),
		answeredThisGate: state.answeredThisGate,
		allAnswered: state.allAnswered ?? [],
		passedChecks: state.clearedChecks,
		demands: gateDemands(state.pipeline, state.gatesCleared),
		...pipelineModifiersFor(state.pipeline.configs),
		gateRewardPaidKb: state.gateRewardKb ?? 0,
		faucetThisGateKb: state.faucetThisGateKb ?? 0,
		gatesCleared: state.gatesCleared,
		gateTheme: swatchForGate(state.gatesCleared)?.theme,
		clearedGateNumber: state.clearedGate ?? state.gatesCleared,
		victoryGate: VICTORY_GATE,
		stripsOnFailure: dropCount(state.gatesCleared),
		pollsToGate: SLICE_WINDOW - state.window.answered,
		pollsAnswered: state.window.answered,
		pollsPerGate: SLICE_WINDOW,
		streak: state.streak,
		coverage: state.coverage,
		coverageByCategory: state.coverageByCategory,
		coverageGainedThisGate: gainedThisGate(state),
		storage: state.storage,
		storageCap,
		ownedStorageConfigs: state.ownedStorageConfigs,
		availableStorageConfigs,
		draftCostReduction: effects.draftCostReduction ?? 0,
		refundBoost: effects.refundBoost ?? 0,
		payoutBoost: effects.payoutBoost ?? 0,
		freeRebuild: effects.freeRebuild ?? false,
		log: state.log,
	};
};

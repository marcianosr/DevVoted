import type { CategoryCode } from "~/shared/lib/categories";
import {
	type AnsweredPoll,
	type AnswerOutcome,
	type AnswerType,
	canBuyPeek,
	canExtend,
	canLock,
	canPlantPin,
	canRebuild,
	canRunLinter,
	canStart,
	pinAvailable,
	extendAvailable,
	lockAvailable,
	rebuildAvailable,
	isAwaitingTomorrow,
	isRunOver,
	isShopLocked,
	lintApplies,
	lintFeeFor,
	peekApplies,
	mirrorPoll,
	offlineConfigsOf,
	peekFeeFor,
	type RunPoll,
	type RunState,
	type RunStatus,
} from "~/modules/run/run/domain/run.model";
import {
	type Config,
	draftCost,
} from "~/modules/run/config/domain/config.model";
import {
	extendCost,
	LOCK_COST_KB,
	rebuildCost,
} from "~/modules/run/shop/domain/draft.model";
import {
	failStripQuotaFor,
	gateDemandFor,
} from "~/modules/run/gate/domain/gate.model";
import {
	auditsForGate,
	auditTimeLimitMs,
	liveAuditsFor,
	mirrorsPolls,
	suppressedAuditFor,
} from "~/modules/run/gate/domain/audit.model";
import {
	swatchForGate,
	type SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";
import {
	type CoverageConfigBonus,
	type PerAnswerPreview,
	type PipelineModifiers,
	budgeterFor,
	linterFor,
	nextSlotGateFor,
	peekerFor,
	perAnswerPreviewFor,
	pipelineModifiersFor,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	atMinimumWidth,
	isStakeFatal,
	isStoragePlanUnlocked,
	pinCostFor,
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

/** A gate audit as the screens render it (ADR-035). */
export type AuditView = {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly answerCue?: string;
	/** Volkswagen CI is reporting this one as passing — struck through. */
	readonly suppressed: boolean;
};

/**
 * What the coming gate demands and what it pays — the subject of
 * `GateStakeReceipt`, which Prep, Configuring and Shop all render.
 *
 * Clustered rather than flattened for the same reason as `modifiers`: the three
 * screens were each carrying the seven fields as props only to hand them on, so
 * every added field cost four edits and none of them a decision.
 */
export type GateStake = {
	readonly gateNumber: number;
	readonly pollsPerGate: number;
	/** Coverage the gate demands within its own window (ADR-035), and the meter
	 * the current attempt holds — paired here so every stake surface can grade
	 * the demand without threading run state beside the stake. */
	readonly coverageDemand: number;
	readonly coverageHeld: number;
	/** The gate's personality rules, suppressed ones included — the receipt's
	 * Audit section. */
	readonly audits: readonly AuditView[];
	/** What a miss peels from this build (ADR-037), and whether that peel takes
	 * the whole of it — the receipt states both before the player commits. */
	readonly stripsOnFailure: number;
	readonly missIsFatal: boolean;
	readonly billKb: number;
	readonly modifiers: PipelineModifiers;
	readonly perAnswer: PerAnswerPreview;
};

/**
 * Why the shop will not install an offer. Carries the numbers, not the
 * sentence: the wording lives beside `shopExitAction` in the shop screen, so
 * every phrasing stays reachable from a story rather than only from the engine
 * state that produces it.
 */
export type OfferRefusal =
	| { readonly reason: "no-slot" }
	| {
			readonly reason: "too-expensive";
			readonly priceKb: number;
			readonly storageKb: number;
	  };

/**
 * One draft option, priced against the run looking at it. The shop used to
 * answer all of this itself from raw roster configs, which put the offer
 * economics behind `render()` and out of reach of the viewmodel's own spec.
 */
export type ShopOffer = {
	readonly config: Config;
	readonly priceKb: number;
	readonly owned: boolean;
	readonly locked: boolean;
	readonly installable: boolean;
	readonly refusal: OfferRefusal | null;
	/** What the build's payouts become with this installed — the hover preview. */
	readonly preview: PipelineModifiers;
	readonly previewPerAnswer: PerAnswerPreview;
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
	/** `draftOptions` with the run's own answer attached to each. */
	readonly offers: readonly ShopOffer[];
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
	readonly canPeek: boolean;
	readonly peekReady: boolean;
	readonly peekCost: number;
	readonly peeker: Config | null;
	/** Configs an audit has taken offline for the poll on screen (ADR-038) —
	 * empty when nothing is down. Their effects are already out of `modifiers`
	 * and `perAnswer`; this is only how the screen says so. */
	readonly offlineConfigs: readonly Config[];
	/** This gate mirrors its polls, so the question asks for the incorrect
	 * options and the poll's own type has already been flipped. */
	readonly mirroredPolls: boolean;
	/** The clock on the poll on screen, in ms; null when it runs free. */
	readonly pollTimeLimitMs: number | null;
	/** Whether this poll's split is already paid for — the screen shows the bars
	 * off this, and the split query refuses to answer until it is true. */
	readonly currentPollPeeked: boolean;
	/** Correct answers this gate's polls hold (`.length`'s reveal). Null when no
	 * config is counting, which is what hides the line. */
	readonly correctAnswersThisGate: number | null;
	readonly rebuildCost: number;
	readonly canRebuild: boolean;
	/** False while WTFPL shows the whole catalog — a reroll would sell nothing. */
	readonly rebuildAvailable: boolean;

	readonly lockAvailable: boolean;
	readonly lockCost: number;
	readonly canLock: boolean;
	readonly lockedOfferIds: readonly string[];
	readonly extendAvailable: boolean;
	readonly extendCost: number;
	readonly canExtend: boolean;
	/** Read-only (ADR-038) has shut the coming gate's shop: every buy, sell and
	 * plan change refuses, and the screen says so instead of the buttons. */
	readonly shopLocked: boolean;
	/** The git tag (ADR-036): sold from gate 4, once per run, burn on use. */
	readonly pinAvailable: boolean;
	readonly pinCost: number;
	readonly canPin: boolean;
	/** The gate this run's tag sits at; null while none is planted. */
	readonly pinnedAtGate: number | null;
	/** The gate whose clear opens the next slot (ADR-034); null at the cap. */
	readonly nextSlotGate: number | null;

	readonly justUnlockedSlots: readonly number[];
	/** The config Dependabot bumped at the last clear; null when nothing was. */
	readonly autoUpgradedConfig: Config | null;
	/** Configs that faded to ×1 at the last clear and deleted themselves. */
	readonly deletedConfigs: readonly Config[];
	/** The live audits' answering-screen cues (suppressed ones excluded). */
	readonly audits: readonly AuditView[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	readonly allAnswered: readonly AnsweredPoll[];
	/** Kept whole rather than flattened: every screen that shows pricing wants all
	 * four at once, and a spread here means each one reassembles them by hand. */
	readonly modifiers: PipelineModifiers;
	readonly perAnswer: PerAnswerPreview;
	readonly gateStake: GateStake;
	readonly canStart: boolean;
	readonly isOver: boolean;
	readonly gateRewardPaidKb: number;
	readonly faucetThisGateKb: number;
	/** The two slices of `gateRewardPaidKb` the loadout alone cannot re-derive —
	 * both price off the balance or the window, so the reward ledger reads them
	 * from the reducer rather than recomputing them. */
	readonly interestThisGateKb: number;
	readonly extraPickThisGateKb: number;
	readonly gatesCleared: number;

	readonly gateTheme?: SwatchTheme;

	readonly clearedGateNumber: number;
	/** The gate being replayed after a fail (ADR-035); null otherwise. */
	readonly redoingGate: number | null;
	readonly victoryGate: number;

	/** One config left — sell and drop refuse, a pipeline never goes bare. */
	readonly atMinimumWidth: boolean;

	readonly pollsAnswered: number;
	readonly pollsPerGate: number;
	readonly streak: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
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

const offerRefusal = (
	state: RunState,
	config: Config,
	isFull: boolean
): OfferRefusal | null => {
	if (isFull) return { reason: "no-slot" };
	const priceKb = draftCost(config);
	if (state.storage < priceKb)
		return { reason: "too-expensive", priceKb, storageKb: state.storage };
	return null;
};

const offersFor = (state: RunState): readonly ShopOffer[] => {
	const installed = state.pipeline.configs;
	const isFull = installed.length >= state.pipeline.slots;
	const locked = state.lockedOfferIds ?? [];

	return state.draftOptions.map((config) => {
		const owned = installed.some((slotted) => slotted.id === config.id);
		const refusal = offerRefusal(state, config, isFull);
		const withIt = [...installed, config];
		return {
			config,
			priceKb: draftCost(config),
			owned,
			locked: locked.includes(config.id),
			installable: !owned && refusal === null,
			refusal,
			preview: pipelineModifiersFor(withIt, state.gatesCleared),
			previewPerAnswer: perAnswerPreviewFor(withIt, state.gatesCleared),
		};
	});
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

const auditViewsFor = (state: RunState): readonly AuditView[] => {
	const suppressed = suppressedAuditFor(
		state.pipeline.configs,
		state.gatesCleared
	);
	return auditsForGate(state.gatesCleared).map((audit) => ({
		id: audit.id,
		name: audit.name,
		description: audit.description,
		answerCue: audit.answerCue,
		suppressed: audit.id === suppressed?.id,
	}));
};

export const toRunView = (state: RunState): RunView => {
	const current = state.polls[state.currentIndex];
	const nextRebuildCost = rebuildCost(state.rebuildsUsed);
	const nextLintCost = lintFeeFor(state);
	const plan = storagePlanFor(state.storagePlan);
	const locked = state.lockedOfferIds ?? [];
	const extensions = state.extensionsBought ?? 0;
	const nextExtendCost = extendCost(extensions);
	const modifiers = pipelineModifiersFor(
		state.pipeline.configs,
		state.gatesCleared
	);
	const perAnswer = perAnswerPreviewFor(
		state.pipeline.configs,
		state.gatesCleared
	);
	const strips = failStripQuotaFor(state.pipeline.configs, state.gatesCleared);
	const liveAudits = liveAuditsFor(state.pipeline.configs, state.gatesCleared);
	const offline = offlineConfigsOf(state);
	const mirrored = mirrorsPolls(liveAudits);

	return {
		status: state.status,
		slots: state.pipeline.slots,
		configs: state.pipeline.configs,
		available: state.available,
		draftOptions: state.draftOptions,
		offers: offersFor(state),
		newConfigIds: state.draftedThisGate,
		stripsRemaining: state.stripsRemaining,
		poll:
			state.status === "answering" && current
				? redactPoll(mirrored ? mirrorPoll(current) : current)
				: null,
		awaitingTomorrow: isAwaitingTomorrow(state),
		pollsExhausted: state.currentIndex >= state.polls.length,
		// Only options the player paid to lint off — no automatic masking.
		disabledOptionIds: state.manualDisabled,
		canLint: lintApplies(state),
		lintReady: canRunLinter(state),
		lintCost: nextLintCost,
		canPeek: peekApplies(state),
		peekReady: canBuyPeek(state),
		peekCost: peekFeeFor(state),
		peeker: peekerFor(state.pipeline.configs) ?? null,
		offlineConfigs: offline,
		mirroredPolls: mirrored,
		pollTimeLimitMs:
			auditTimeLimitMs(liveAudits, state.window.answered) ?? null,
		currentPollPeeked:
			current !== undefined && (state.peekedPollIds ?? []).includes(current.id),
		correctAnswersThisGate:
			budgeterFor(state.pipeline.configs) === undefined
				? null
				: (state.window.budget ?? null),
		rebuildCost: nextRebuildCost,
		canRebuild: canRebuild(state),
		rebuildAvailable: rebuildAvailable(state),
		lockAvailable: lockAvailable(state),
		lockCost: LOCK_COST_KB,
		canLock: canLock(state),
		lockedOfferIds: locked,
		extendAvailable: extendAvailable(state),
		extendCost: nextExtendCost,
		canExtend: canExtend(state),
		shopLocked: isShopLocked(state),
		pinAvailable: pinAvailable(state),
		pinCost: pinCostFor(state.gatesCleared),
		canPin: canPlantPin(state),
		pinnedAtGate: state.pinPlantedAtGate ?? null,
		nextSlotGate: nextSlotGateFor(state.pipeline.slots),
		justUnlockedSlots: state.justUnlockedSlots ?? [],
		autoUpgradedConfig:
			state.pipeline.configs.find(
				(config) => config.id === state.autoUpgradedConfigId
			) ?? null,
		deletedConfigs: state.deletedConfigs ?? [],
		audits: auditViewsFor(state),
		linter:
			current === undefined
				? null
				: (linterFor(state.pipeline.configs, current.category) ?? null),
		answeredThisGate: state.answeredThisGate,
		allAnswered: state.allAnswered ?? [],
		modifiers,
		perAnswer,
		gateStake: {
			gateNumber: state.gatesCleared,
			pollsPerGate: SLICE_WINDOW,
			coverageDemand: gateDemandFor(state.pipeline.configs, state.gatesCleared),
			coverageHeld: state.window.coverageGained,
			audits: auditViewsFor(state),
			stripsOnFailure: strips,
			missIsFatal: isStakeFatal(strips, state.pipeline.configs.length),
			billKb: plan.billKb,
			modifiers,
			perAnswer,
		},
		canStart: canStart(state.pipeline),
		isOver: isRunOver(state.status),
		gateRewardPaidKb: state.gateRewardKb ?? 0,
		faucetThisGateKb: state.faucetThisGateKb ?? 0,
		interestThisGateKb: state.interestThisGateKb ?? 0,
		extraPickThisGateKb: state.extraPickThisGateKb ?? 0,
		gatesCleared: state.gatesCleared,
		gateTheme: swatchForGate(state.gatesCleared)?.theme,
		clearedGateNumber: state.clearedGate ?? state.gatesCleared,
		redoingGate: state.redoGate ?? null,
		victoryGate: VICTORY_GATE,
		atMinimumWidth: atMinimumWidth(state.pipeline.configs.length),
		pollsAnswered: state.window.answered,
		pollsPerGate: SLICE_WINDOW,
		streak: state.streak,
		coverage: state.coverage,
		coverageByCategory: state.coverageByCategory,
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

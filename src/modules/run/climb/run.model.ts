import type { CategoryCode } from "~/domains/shared/categories";

import {
	Pipeline,
	BASE_SLOTS,
	canAddSlot,
	canLint,
	type CoverageBreakdown,
	coverageBreakdownForAnswer,
	coverageForAnswer,
	gateClearPayout,
	gateFitsPipeline,
	isBare,
	linterFor,
	rewardMultiplierFor,
	stripConfig,
} from "../pipeline/pipeline.model";
import {
	Config,
	draftCost,
	isUpgradable,
	sellRefund,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "../configs/config.model";
import {
	type AnswerContext,
	type CheckStatus,
	EMPTY_WINDOW,
	GateWindow,
} from "../configs/effect.model";
import { DRAFT_SIZE, rebuildCost, rollDraft } from "../draft/draft.model";
import { checkStatuses, gateDemands, gatePassed } from "../gate/gate.model";
import {
	dropCount,
	FAUCET_CAP_KB,
	gateBaseMultiplier,
	pollDifficultyMultiplier,
	roundToOneDecimal,
	SLICE_WINDOW,
	STORAGE_CAP_KB,
	streakMultiplier,
	VICTORY_GATE,
	WRONG_COVERAGE_LOSS,
} from "../rules.model";

const LINT_COSTS = [8, 16, 32, 64, 128, 256];

/** Cost (KB) of the next linter run this poll — doubles each use, capped at 256. */
export const lintCost = (usesThisPoll: number): number =>
	LINT_COSTS[usesThisPoll] ?? LINT_COSTS[LINT_COSTS.length - 1];

const addStorage = (current: number, income: number): number =>
	Math.min(current + income, STORAGE_CAP_KB);

export type RunOption = {
	readonly id: string;
	readonly label: string;
	readonly correct: boolean;
};
export type AnswerType = "single" | "multiple";

export type RunPoll = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly codeBlock?: string;
	readonly codeSandboxUrl?: string;
	readonly answerType: AnswerType;
	readonly options: readonly RunOption[];
	readonly explanation?: string;
};

const isCorrect = (poll: RunPoll, optionIds: readonly string[]): boolean => {
	const selected = new Set(optionIds);
	const correctIds = poll.options
		.filter((option) => option.correct)
		.map((option) => option.id);
	if (poll.answerType === "single")
		return optionIds.length === 1 && correctIds.includes(optionIds[0]);
	return (
		correctIds.length === selected.size &&
		correctIds.every((id) => selected.has(id))
	);
};

export type AnswerOutcome = "correct" | "partial" | "wrong";

/**
 * The answer's correctness share for coverage: 1 when fully correct, 0 on a
 * miss, and on multi-answer polls the fraction of the correct set actually
 * demonstrated — every wrong pick cancels a right one, so shotgunning every
 * option earns nothing (Marciano, 2026-07-19). Gate math, streak, and storage
 * stay binary; only coverage reads this.
 */
const coverageShare = (poll: RunPoll, optionIds: readonly string[]): number => {
	if (isCorrect(poll, optionIds)) return 1;
	if (poll.answerType === "single") return 0;
	const picked = new Set(optionIds);
	const correctIds = poll.options
		.filter((option) => option.correct)
		.map((option) => option.id);
	if (correctIds.length === 0) return 0;
	const correctPicked = correctIds.filter((id) => picked.has(id)).length;
	const wrongPicked = optionIds.length - correctPicked;
	return Math.max(
		0,
		Math.min(1, (correctPicked - wrongPicked) / correctIds.length)
	);
};

/**
 * Partial exists only on multiple-answer polls: at least one correct option
 * picked without matching the exact correct set. Gate math stays binary
 * (isCorrect) — outcome is for the answer review, not for judging.
 */
const answerOutcome = (
	poll: RunPoll,
	optionIds: readonly string[]
): AnswerOutcome => {
	if (isCorrect(poll, optionIds)) return "correct";
	if (poll.answerType === "single") return "wrong";
	const pickedACorrectOption = poll.options.some(
		(option) => option.correct && optionIds.includes(option.id)
	);
	return pickedACorrectOption ? "partial" : "wrong";
};

const nextStreak = (current: number, outcome: AnswerOutcome): number => {
	if (outcome === "correct") return current + 1;
	if (outcome === "wrong") return 0;
	return current;
};

// Mirrors nextStreak from the other side: a partial neither cleans nor dirties
// the miss record, so Code Coverage's no-double-miss check judges full misses only.
const nextMissStreak = (current: number, outcome: AnswerOutcome): number => {
	if (outcome === "wrong") return current + 1;
	if (outcome === "correct") return 0;
	return current;
};

export type RunStatus =
	"configuring" | "answering" | "awaiting-strip" | "rewarding" | "won" | "dead";

export type AnsweredPoll = {
	readonly id: string;
	readonly question: string;
	readonly category: CategoryCode;
	readonly outcome: AnswerOutcome;
	readonly picked: readonly string[];
	// Optional: runs snapshotted before these fields existed won't carry them.
	readonly correct?: readonly string[];
	readonly explanation?: string;
	readonly options?: readonly string[];
	readonly answerType?: AnswerType;
	/** Coverage this answer earned (share-scaled for partial multi picks). */
	readonly coverageEarned?: number;
	/** How that coverage broke down (base + streak + per-config) for the reveal. */
	readonly coverageBreakdown?: CoverageBreakdown;
	/** Client-measured reveal→submit ms (absent on old snapshots/clients). */
	readonly elapsedMs?: number;
};

export type RunState = {
	readonly status: RunStatus;
	readonly pipeline: Pipeline;
	readonly available: readonly Config[];
	readonly draftOptions: readonly Config[];
	readonly rebuildsUsed: number;
	readonly draftedThisGate: readonly string[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	// Every poll answered across the whole run, never reset per gate — feeds the
	// end-of-run review. Optional: runs snapshotted before it existed won't carry
	// it, so read sites fall back to `answeredThisGate`/`[]`.
	readonly allAnswered?: readonly AnsweredPoll[];
	readonly clearedChecks: readonly CheckStatus[];
	readonly stripsRemaining: number;
	readonly polls: readonly RunPoll[];
	readonly currentIndex: number;
	readonly window: GateWindow;
	readonly manualDisabled: readonly string[];
	readonly gatesCleared: number;
	readonly streak: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly storage: number;
	// Cumulative per-correct faucet income this run, capped at FAUCET_CAP_KB.
	// Optional: runs snapshotted before it existed won't carry it.
	readonly faucetEarnedKb?: number;
	/** Faucet income inside the current window — feeds the gate report's exact row. */
	readonly faucetThisGateKb?: number;
	/** What the just-cleared gate actually paid (correctness- and depth-scaled) — feeds the reward report. */
	readonly gateRewardKb?: number;
	/**
	 * The gate number the last clear actually beat. Not derivable from
	 * `gatesCleared` once the gate–slot cap freezes the climb (a frozen replay
	 * leaves `gatesCleared` behind the gate it just cleared). Optional: old
	 * snapshots won't carry it — readers fall back to `gatesCleared`.
	 */
	readonly clearedGate?: number;
	/**
	 * The last clear passed its gate but could not advance the climb: the pipeline
	 * is too narrow for the next gate (ADR-018). `addSlot` reads this to know an
	 * advance is pending. It cannot be inferred from `clearedGate` vs
	 * `gatesCleared` now that gates count from 0 — while held, the two are equal.
	 */
	readonly heldAtGate?: boolean;
	readonly log: readonly string[];
};

export type RunAction =
	| { readonly type: "slot"; readonly configId: string }
	| { readonly type: "unslot"; readonly configId: string }
	| { readonly type: "start" }
	| {
			readonly type: "answer";
			readonly optionIds: readonly string[];
			/** Client-measured reveal→submit ms — award data, absent on old clients. */
			readonly elapsedMs?: number;
	  }
	| { readonly type: "lint-poll" }
	| { readonly type: "strip"; readonly configId: string }
	| { readonly type: "resume-climb" }
	| { readonly type: "add-slot" }
	| { readonly type: "draft"; readonly configId: string }
	| { readonly type: "upgrade"; readonly configId: string }
	| { readonly type: "rebuild-draft" }
	| { readonly type: "finish-reward" }
	| { readonly type: "sell"; readonly configId: string }
	| { readonly type: "drop"; readonly configId: string };

export const createRun = (
	polls: readonly RunPoll[],
	handed: readonly Config[]
): RunState => ({
	status: "configuring",
	pipeline: { id: "pipeline", slots: BASE_SLOTS, configs: [] },
	available: handed,
	draftOptions: [],
	rebuildsUsed: 0,
	draftedThisGate: [],
	answeredThisGate: [],
	allAnswered: [],
	clearedChecks: [],
	stripsRemaining: 0,
	polls,
	currentIndex: 0,
	window: EMPTY_WINDOW,
	manualDisabled: [],
	gatesCleared: 0,
	streak: 0,
	coverage: 0,
	coverageByCategory: {},
	storage: 0,
	faucetEarnedKb: 0,
	faucetThisGateKb: 0,
	gateRewardKb: 0,
	log: [],
});

export { gateDemands, canLint, rebuildCost };

const withLog = (state: RunState, ...lines: string[]): readonly string[] => [
	...state.log,
	...lines,
];

/**
 * Out of polls while answering — the day's segment is exhausted and the run
 * waits for tomorrow's polls (ADR-014). Derived on purpose: the reducer is
 * day-unaware, so the rollover appending tomorrow's segment is the unlock.
 */
export const isAwaitingTomorrow = (state: RunState): boolean =>
	state.status === "answering" && state.currentIndex >= state.polls.length;
const withPipeline = (
	pipeline: Pipeline,
	configs: readonly Config[]
): Pipeline => ({
	...pipeline,
	configs,
});

const slotConfig = (state: RunState, configId: string): RunState => {
	const config = state.available.find((candidate) => candidate.id === configId);
	if (!config || state.pipeline.configs.length >= state.pipeline.slots)
		return state;
	return {
		...state,
		available: state.available.filter((candidate) => candidate.id !== configId),
		pipeline: withPipeline(state.pipeline, [...state.pipeline.configs, config]),
	};
};

const unslotConfig = (state: RunState, configId: string): RunState => {
	const config = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!config) return state;
	return {
		...state,
		available: [...state.available, config],
		pipeline: withPipeline(
			state.pipeline,
			state.pipeline.configs.filter((candidate) => candidate.id !== configId)
		),
	};
};

const closeWindow = (state: RunState, nextIndex: number): RunState => {
	const gateNumber = state.gatesCleared;

	if (!gatePassed(state.pipeline, state.window, state.gatesCleared)) {
		if (isBare(state.pipeline))
			return {
				...state,
				currentIndex: nextIndex,
				status: "dead",
				log: withLog(
					state,
					`Gate ${gateNumber} broke a bare build — run over.`
				),
			};
		const toDrop = Math.min(
			dropCount(state.gatesCleared),
			state.pipeline.configs.length
		);
		return {
			...state,
			currentIndex: nextIndex,
			status: "awaiting-strip",
			stripsRemaining: toDrop,
			log: withLog(
				state,
				`Gate ${gateNumber} failed. Peel ${toDrop} config${toDrop > 1 ? "s" : ""}.`
			),
		};
	}

	// 32KB base × gate number × build multipliers, scaled by window correctness
	// (0/5 pays 0), plus every flat clear payout (Unit Tests' +32) whole.
	const reward = gateClearPayout(
		state.pipeline.configs,
		state.window.correct,
		state.gatesCleared
	);
	// faucetThisGateKb/gateRewardKb are NOT reset here: the reward report still
	// reads them while the shop is open. finishReward clears them.
	//
	// Every gate past the first is bought with a slot (ADR-018): the climb only
	// advances when the next gate already fits the pipeline. Otherwise the clear
	// still pays but `gatesCleared` freezes, so demands, payout, and strips stay
	// flat across the replay and farming stays priced out by the
	// correctness-scaled payout. `addSlot` is what releases the hold — the claim
	// is the moment the gate advances.
	const heldAtGate = !gateFitsPipeline(gateNumber + 1, state.pipeline.slots);
	const cleared: RunState = {
		...state,
		window: EMPTY_WINDOW,
		manualDisabled: [],
		gatesCleared: heldAtGate ? state.gatesCleared : state.gatesCleared + 1,
		clearedGate: gateNumber,
		heldAtGate,
		storage: addStorage(state.storage, reward),
		gateRewardKb: reward,
		currentIndex: nextIndex,
	};

	// Victory outranks the freeze: it checks the uncapped gate number and
	// records the summit uncapped, so clearing gate 12 with 12 slots still wins.
	if (gateNumber >= VICTORY_GATE)
		return {
			...cleared,
			// The summit is recorded as a full count, uncapped by the freeze.
			gatesCleared: gateNumber + 1,
			heldAtGate: false,
			status: "won",
			log: withLog(
				state,
				`Gate ${gateNumber} cleared — you summited! +${reward}KB`
			),
		};

	return {
		...cleared,
		draftOptions: rollDraft(gateNumber, state.pipeline.configs),
		rebuildsUsed: 0,
		draftedThisGate: [],
		clearedChecks: checkStatuses(
			state.pipeline,
			state.window,
			state.gatesCleared
		),
		status: "rewarding",
		log: withLog(
			state,
			heldAtGate
				? `Gate ${gateNumber} cleared! +${reward}KB — widen the pipeline to climb past it.`
				: `Gate ${gateNumber} cleared! +${reward}KB — spend it in the shop.`
		),
	};
};

const answer = (
	state: RunState,
	optionIds: readonly string[],
	elapsedMs?: number
): RunState => {
	if (optionIds.length === 0) return state;
	const poll = state.polls[state.currentIndex];
	// Awaiting tomorrow's segment (ADR-014): no poll to answer is a no-op,
	// not a crash — the status stays "answering" until rollover appends polls.
	if (!poll) return state;

	const configs = state.pipeline.configs;
	const correct = isCorrect(poll, optionIds);
	const outcome = answerOutcome(poll, optionIds);
	const openingClean = state.window.leadingCorrect === state.window.answered;
	const share = coverageShare(poll, optionIds);
	// Deeper gates raise the stakes both ways: the gate number scales the
	// correctness share before configs/streak amplify it, so gate 2 earns off a
	// base of 2, not 1 — and the loss below scales by the same factor, so a miss
	// at gate 5 hurts as much as a hit there helps. Coverage stays floored at 0.
	const gateMultiplier = gateBaseMultiplier(state.gatesCleared);
	// Harder polls pay more: more options and multiple-choice ("select all")
	// scale the earned share. Gains-only — the loss below ignores it — so
	// tackling a hard poll is never punished harder for missing.
	const difficultyMultiplier = pollDifficultyMultiplier(
		poll.options.length,
		poll.answerType === "multiple"
	);
	const scoredShare = share * gateMultiplier * difficultyMultiplier;
	// Streak updates first so this answer scores at its new level (a correct
	// reaching streak 3 earns at 1.3×). Then it multiplies the earn last.
	const streak = nextStreak(state.streak, outcome);
	// answeredBefore reads the pre-update window: 0 marks the window's opener,
	// which is what Cold Start's opener multiplier keys off.
	const answerContext: AnswerContext = {
		category: poll.category,
		answeredBefore: state.window.answered,
	};
	const earned = coverageForAnswer(
		configs,
		answerContext,
		scoredShare,
		streakMultiplier(streak)
	);
	// A miss (share 0) bleeds coverage: base loss scaled by the build's reward
	// multiplier AND the gate — risk cuts both ways, and it cuts deeper the higher
	// you climb. Raw rules only: coverage configs never amplify a loss.
	const coverageLoss =
		share > 0
			? 0
			: roundToOneDecimal(
					WRONG_COVERAGE_LOSS *
						rewardMultiplierFor(state.pipeline.configs) *
						gateMultiplier
				);
	const coverageBreakdown = coverageBreakdownForAnswer(
		configs,
		answerContext,
		scoredShare,
		streakMultiplier(streak),
		coverageLoss
	);
	const categoryBefore = state.coverageByCategory[poll.category] ?? 0;
	const categoryAfter = roundToOneDecimal(
		Math.max(0, categoryBefore + earned - coverageLoss)
	);
	const rawFaucet = correct
		? configs.reduce((sum, config) => sum + (config.storagePerCorrect ?? 0), 0)
		: 0;
	// Faucet income dries up at the per-run cap — partial payouts included, so
	// a run at 316/320 still collects the last 4KB.
	const faucetEarnedBefore = state.faucetEarnedKb ?? 0;
	const faucet = Math.min(
		rawFaucet,
		Math.max(0, FAUCET_CAP_KB - faucetEarnedBefore)
	);
	// The lint spend is recorded per linter BEFORE manualDisabled resets below —
	// this answer settles whether the linted poll was answered correctly.
	const linter =
		state.manualDisabled.length > 0
			? linterFor(configs, poll.category)
			: undefined;
	const lintedBefore = state.window.lintedByConfig ?? {};
	const lintedByConfig = linter
		? {
				...lintedBefore,
				[linter.id]: {
					polls: (lintedBefore[linter.id]?.polls ?? 0) + 1,
					correct: (lintedBefore[linter.id]?.correct ?? 0) + (correct ? 1 : 0),
				},
			}
		: lintedBefore;
	const missStreak = nextMissStreak(state.window.missStreak ?? 0, outcome);
	const tally = state.window.byCategory[poll.category] ?? {
		seen: 0,
		correct: 0,
	};
	const nextIndex = state.currentIndex + 1;

	const window: GateWindow = {
		correct: state.window.correct + (correct ? 1 : 0),
		answered: state.window.answered + 1,
		coverageGained: roundToOneDecimal(state.window.coverageGained + earned),
		leadingCorrect:
			openingClean && correct
				? state.window.leadingCorrect + 1
				: state.window.leadingCorrect,
		byCategory: {
			...state.window.byCategory,
			[poll.category]: {
				seen: tally.seen + 1,
				correct: tally.correct + (correct ? 1 : 0),
				gained: roundToOneDecimal((tally.gained ?? 0) + earned),
			},
		},
		missStreak,
		maxMissStreak: Math.max(state.window.maxMissStreak ?? 0, missStreak),
		lintedByConfig,
	};

	const answeredPoll: AnsweredPoll = {
		id: poll.id,
		question: poll.question,
		category: poll.category,
		outcome,
		picked: poll.options
			.filter((option) => optionIds.includes(option.id))
			.map((option) => option.label),
		correct: poll.options
			.filter((option) => option.correct)
			.map((option) => option.label),
		explanation: poll.explanation,
		options: poll.options.map((option) => option.label),
		answerType: poll.answerType,
		coverageEarned: earned,
		coverageBreakdown,
		elapsedMs,
	};

	const answered: RunState = {
		...state,
		window,
		manualDisabled: [],
		streak,
		storage: addStorage(state.storage, faucet),
		faucetEarnedKb: faucetEarnedBefore + faucet,
		faucetThisGateKb: (state.faucetThisGateKb ?? 0) + faucet,
		// The loss drains the poll's category (floored at 0) and the total
		// moves by what the category actually lost — total stays the sum of
		// the categories, and you can't lose coverage you don't have.
		// window.coverageGained stays a gains-only tally, so coverage-gain
		// checks aren't double-punished.
		coverage: roundToOneDecimal(
			Math.max(0, state.coverage + categoryAfter - categoryBefore)
		),
		coverageByCategory: {
			...state.coverageByCategory,
			[poll.category]: categoryAfter,
		},
		answeredThisGate: [...state.answeredThisGate, answeredPoll],
		allAnswered: [...(state.allAnswered ?? []), answeredPoll],
	};

	if (window.answered >= SLICE_WINDOW) return closeWindow(answered, nextIndex);
	return {
		...answered,
		currentIndex: nextIndex,
		status: "answering",
	};
};

const wrongStillOn = (state: RunState) => {
	const poll = state.polls[state.currentIndex];
	const alreadyOff = new Set<string>(state.manualDisabled);
	return poll.options.filter(
		(option) => !option.correct && !alreadyOff.has(option.id)
	);
};

export const lintApplies = (state: RunState): boolean => {
	const poll = state.polls[state.currentIndex];
	if (!poll || !canLint(state.pipeline.configs, poll.category)) return false;
	return wrongStillOn(state).length > 1;
};

export const canRunLinter = (state: RunState): boolean =>
	lintApplies(state) && state.storage >= lintCost(state.manualDisabled.length);

const spendLint = (state: RunState): RunState => {
	if (!canRunLinter(state)) return state;
	const cost = lintCost(state.manualDisabled.length);
	return {
		...state,
		storage: state.storage - cost,
		manualDisabled: [...state.manualDisabled, wrongStillOn(state)[0].id],
		log: withLog(state, `Ran the linter (-${cost}KB).`),
	};
};

const strip = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(config) => config.id === configId
	);
	if (!target || state.stripsRemaining <= 0) return state;
	const pipeline = stripConfig(state.pipeline, configId);
	const remaining = state.stripsRemaining - 1;
	return {
		...state,
		pipeline,
		stripsRemaining: remaining,
		log: withLog(
			state,
			remaining > 0
				? `Peeled a config. ${remaining} more to drop.`
				: `Build repaired — climb on when ready.`
		),
	};
};

/** Commit the repaired build and resume the climb. No-op until the peel quota is met. */
const resumeClimb = (state: RunState): RunState => {
	if (state.stripsRemaining > 0) return state;
	return {
		...state,
		window: EMPTY_WINDOW,
		manualDisabled: [],
		faucetThisGateKb: 0,
		gateRewardKb: 0,
		answeredThisGate: [],
		status: "answering",
		log: withLog(
			state,
			`Climbing on with ${state.pipeline.configs.length} configs.`
		),
	};
};

const stayReward = (
	state: RunState,
	pipeline: Pipeline,
	draftOptions: readonly Config[],
	line: string
): RunState => ({
	...state,
	pipeline,
	draftOptions,
	log: withLog(state, line),
});

const levelUp = (config: Config): Config => ({
	...config,
	level: (config.level ?? 1) + 1,
});

/**
 * Claiming a slot is what advances the climb (ADR-018). A clear that could not
 * fit the next gate left `clearedGate` ahead of `gatesCleared`; once the new
 * width fits that next gate, the pending advance lands here. Widening beyond
 * what the next gate needs simply banks width for later gates.
 */
const addSlot = (state: RunState): RunState => {
	if (!canAddSlot(state.pipeline.slots, state.coverage)) return state;
	const slots = state.pipeline.slots + 1;
	const nextGate = state.gatesCleared + 1;
	const releases =
		state.heldAtGate === true && gateFitsPipeline(nextGate, slots);
	const widened = stayReward(
		state,
		{ ...state.pipeline, slots },
		state.draftOptions,
		releases
			? `Widened the pipeline to ${slots} slots — gate ${nextGate} is next.`
			: `Widened the pipeline to ${slots} slots.`
	);
	return releases
		? { ...widened, gatesCleared: nextGate, heldAtGate: false }
		: widened;
};

const draft = (state: RunState, configId: string): RunState => {
	const chosen = state.draftOptions.find(
		(candidate) => candidate.id === configId
	);
	if (!chosen) return state;
	// Drafts only ever add NEW configs (owned ones are upgraded in the shop, not re-drafted).
	const alreadyOwned = state.pipeline.configs.some(
		(candidate) => candidate.id === configId
	);
	const cost = draftCost(chosen);
	if (
		alreadyOwned ||
		state.pipeline.configs.length >= state.pipeline.slots ||
		state.storage < cost
	)
		return state;
	const remaining = state.draftOptions.filter(
		(candidate) => candidate.id !== configId
	);
	return {
		...stayReward(
			state,
			withPipeline(state.pipeline, [...state.pipeline.configs, chosen]),
			remaining,
			`Drafted ${chosen.label} (-${cost}KB).`
		),
		storage: state.storage - cost,
		draftedThisGate: [...state.draftedThisGate, chosen.id],
	};
};

// Focus upgrades are free but coverage-gated; Unit Tests' upgrade is
// storage-priced (32KB × the level bought) with no coverage requirement.
const upgrade = (state: RunState, configId: string): RunState => {
	const owned = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!owned || !isUpgradable(owned)) return state;
	const level = owned.level ?? 1;
	const levelled = withPipeline(
		state.pipeline,
		state.pipeline.configs.map((config) =>
			config.id === configId ? levelUp(config) : config
		)
	);
	if (owned.focusCategory) {
		const have = state.coverageByCategory[owned.focusCategory] ?? 0;
		if (have < upgradeCoverageRequired(level)) return state;
		return stayReward(
			state,
			levelled,
			state.draftOptions,
			`Upgraded ${owned.label} to L${level + 1}.`
		);
	}
	const cost = upgradeStorageCost(level);
	if (state.storage < cost) return state;
	return stayReward(
		{ ...state, storage: state.storage - cost },
		levelled,
		state.draftOptions,
		`Upgraded ${owned.label} to L${level + 1} for ${cost}KB.`
	);
};

const finishReward = (state: RunState): RunState => ({
	...state,
	draftOptions: [],
	rebuildsUsed: 0,
	draftedThisGate: [],
	answeredThisGate: [],
	clearedChecks: [],
	faucetThisGateKb: 0,
	gateRewardKb: 0,
	status: "answering",
	log: withLog(state, "Climbing on."),
});

const rebuildDraft = (state: RunState): RunState => {
	const cost = rebuildCost(state.rebuildsUsed);
	if (state.storage < cost) return state;
	const nextRebuilds = state.rebuildsUsed + 1;
	return {
		...state,
		storage: state.storage - cost,
		rebuildsUsed: nextRebuilds,
		draftOptions: rollDraft(
			state.gatesCleared + nextRebuilds * DRAFT_SIZE,
			state.pipeline.configs
		),
		log: withLog(state, `Rebuilt the draft (-${cost}KB).`),
	};
};

const sell = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!target) return state;
	const refund = sellRefund(target);
	return {
		...state,
		pipeline: stripConfig(state.pipeline, configId),
		storage: addStorage(state.storage, refund),
		log: withLog(state, `Sold ${target.label} (+${refund}KB).`),
	};
};

const drop = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!target) return state;
	return {
		...state,
		pipeline: withPipeline(
			state.pipeline,
			state.pipeline.configs.filter((candidate) => candidate.id !== configId)
		),
		log: withLog(state, "Dropped a config to make room."),
	};
};

// Committing to the climb requires a full pipeline: every starting slot holds
// a config, so the gate's opening demands are entirely the player's own picks.
const start = (state: RunState): RunState => {
	if (state.pipeline.configs.length < state.pipeline.slots) return state;
	return { ...state, status: "answering" };
};

export const runReducer = (state: RunState, action: RunAction): RunState => {
	if (action.type === "slot" && state.status === "configuring")
		return slotConfig(state, action.configId);
	if (action.type === "unslot" && state.status === "configuring")
		return unslotConfig(state, action.configId);
	if (action.type === "start" && state.status === "configuring")
		return start(state);
	if (action.type === "answer" && state.status === "answering")
		return answer(state, action.optionIds, action.elapsedMs);
	if (action.type === "lint-poll" && state.status === "answering")
		return spendLint(state);
	if (action.type === "strip" && state.status === "awaiting-strip")
		return strip(state, action.configId);
	if (action.type === "resume-climb" && state.status === "awaiting-strip")
		return resumeClimb(state);
	if (action.type === "add-slot" && state.status === "rewarding")
		return addSlot(state);
	if (action.type === "draft" && state.status === "rewarding")
		return draft(state, action.configId);
	if (action.type === "upgrade" && state.status === "rewarding")
		return upgrade(state, action.configId);
	if (action.type === "rebuild-draft" && state.status === "rewarding")
		return rebuildDraft(state);
	if (action.type === "finish-reward" && state.status === "rewarding")
		return finishReward(state);
	if (action.type === "sell" && state.status === "rewarding")
		return sell(state, action.configId);
	if (action.type === "drop" && state.status === "rewarding")
		return drop(state, action.configId);
	return state;
};

export { checkStatuses, currentRequirement } from "../gate/gate.model";

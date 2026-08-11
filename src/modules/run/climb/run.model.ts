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
import { starterStackFor } from "../configs/stack.model";
import { draftSeed, rebuildCost, rollDraft } from "../draft/draft.model";
import { checkStatuses, gateDemands, gatePassed } from "../gate/gate.model";
import { swatchForGate } from "../gate/swatch.model";
import {
	dropCount,
	FAUCET_CAP_KB,
	gateBaseMultiplier,
	minConfigsForGate,
	pollDifficultyMultiplier,
	roundToOneDecimal,
	SLICE_WINDOW,
	STORAGE_PLANS,
	storagePlanFor,
	streakMultiplier,
	VICTORY_GATE,
	WRONG_COVERAGE_LOSS,
} from "../rules.model";

const LINT_COSTS = [8, 16, 32, 64, 128, 256];

/** Cost (KB) of the next linter run this poll — doubles each use, capped at 256. */
export const lintCost = (usesThisPoll: number): number =>
	LINT_COSTS[usesThisPoll] ?? LINT_COSTS[LINT_COSTS.length - 1];

const addStorage = (current: number, income: number): number =>
	current + income;

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
	/**
	 * The snippet the question was asked against. Copied onto the answer rather
	 * than looked up later, because the review outlives the gate's poll list —
	 * without it a snippet question reads as "which of these is not valid?" with
	 * nothing to judge against.
	 */
	readonly codeBlock?: string;
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
	 * Storage-plan tier (rules.model's STORAGE_PLANS). Optional: runs
	 * snapshotted before plans existed carry none and read as the free tier.
	 */
	readonly storagePlan?: number;
	/** What the just-closed window's plan bill collected — feeds the gate report. */
	readonly gateBillKb?: number;
	/** True while the report shows a window whose bill went unpaid, dropping the plan to free. */
	readonly planDowngraded?: boolean;
	/**
	 * The gate number the last clear actually beat — one behind `gatesCleared`,
	 * which the same clear incremented. Recorded rather than re-derived so the
	 * reward screens never have to reason about the off-by-one, and so the
	 * swatch a clear earned stays readable after the fact. Optional: old
	 * snapshots won't carry it — readers fall back to `gatesCleared`.
	 */
	readonly clearedGate?: number;
	/**
	 * Slots auto-widened since the last shop visit (ADR-025) — the shop's
	 * one-time "Unlocked Nth slot" acknowledgment. Reset when the shop is left
	 * (`finishReward`), not when it opens, so it survives to be shown there.
	 * Optional: runs snapshotted before it existed carry none.
	 */
	readonly justUnlockedSlots?: readonly number[];
	readonly log: readonly string[];
};

export type RunAction =
	| { readonly type: "slot"; readonly configId: string }
	| { readonly type: "unslot"; readonly configId: string }
	| { readonly type: "pick-stack"; readonly stackId: string }
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
	| { readonly type: "draft"; readonly configId: string }
	| { readonly type: "upgrade"; readonly configId: string }
	| { readonly type: "rebuild-draft" }
	| { readonly type: "finish-reward" }
	| { readonly type: "sell"; readonly configId: string }
	| { readonly type: "drop"; readonly configId: string }
	| { readonly type: "change-plan"; readonly tier: number };

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
	storagePlan: STORAGE_PLANS[0].tier,
	gateBillKb: 0,
	planDowngraded: false,
	justUnlockedSlots: [],
	log: [],
});

export { gateDemands, canLint, rebuildCost };

const withLog = (state: RunState, ...lines: string[]): readonly string[] => [
	...state.log,
	...lines,
];

/**
 * The shared opening of every gate-clear log line. Names the swatch the clear
 * awarded (ADR-019) — the badge is the clear's own receipt, so it belongs on the
 * same line as the payout rather than only on the reward screen.
 */
const clearLine = (gateNumber: number, reward: number): string => {
	const swatch = swatchForGate(gateNumber);
	const earned = swatch ? `, ${swatch.name} earned` : "";
	return `Gate ${gateNumber} cleared! +${reward}KB${earned}.`;
};

/**
 * Which checks actually failed. A gate fails on any one unmet check, so the log
 * has to name them: the checklist is the whole rulebook (ADR-022), and a bare
 * "gate failed" left the player to guess which row cost them the run. At window
 * close every unmet check has resolved to "failed", so nothing reads as pending.
 */
const failedChecks = (state: RunState): readonly string[] =>
	checkStatuses(state.pipeline, state.window, state.gatesCleared)
		.filter((check) => check.state === "failed")
		.map((check) => check.label);

const failureCause = (state: RunState): string => {
	const failed = failedChecks(state);
	return failed.length > 0 ? `: ${failed.join(", ")}` : "";
};

/**
 * The log line for a fatal fail. A bare build is unreachable since ADR-021, but
 * runs snapshotted before it can resume bare, so both readings stay.
 */
const fatalPeelLine = (
	state: RunState,
	gateNumber: number,
	installed: number
): string => {
	if (installed === 0)
		return `Gate ${gateNumber} broke a bare build — run over.`;
	const plural = installed > 1 ? "s" : "";
	return `Gate ${gateNumber} failed${failureCause(state)}. The peel takes all ${installed} config${plural} — run over.`;
};

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

/**
 * Swap the whole pipeline for a starter stack in one move (ADR-026). Atomic on
 * purpose: applying a stack as N slot actions could commit half a stack when a
 * member is missing from the handed pool. Members resolve against the run's
 * own instances (already-slotted ones included, so switching stacks works), and
 * any member the run wasn't handed makes the whole pick a no-op.
 */
const pickStack = (state: RunState, stackId: string): RunState => {
	const stack = starterStackFor(stackId);
	if (!stack || stack.configs.length > state.pipeline.slots) return state;
	const pool = [...state.pipeline.configs, ...state.available];
	const members = stack.configs.flatMap((member) => {
		const handed = pool.find((config) => config.id === member.id);
		return handed ? [handed] : [];
	});
	if (members.length < stack.configs.length) return state;
	const memberIds = new Set(members.map((config) => config.id));
	return {
		...state,
		pipeline: withPipeline(state.pipeline, members),
		available: pool.filter((config) => !memberIds.has(config.id)),
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

/**
 * The plan's bill lands the moment a window closes — pass or fail, before the
 * payout — so a subscription is a liability exactly when the run wobbles. An
 * unpayable bill is never partially collected: the provider drops the run to
 * the free tier instead. No overflow can burn there (storage sat below the
 * bill), so the downgrade only costs future headroom.
 */
const chargeStorageBill = (state: RunState): RunState => {
	const plan = storagePlanFor(state.storagePlan);
	if (plan.billKb === 0)
		return { ...state, gateBillKb: 0, planDowngraded: false };
	if (state.storage < plan.billKb)
		return {
			...state,
			storagePlan: STORAGE_PLANS[0].tier,
			gateBillKb: 0,
			planDowngraded: true,
			log: withLog(state, "Storage bill unpaid — downgraded to the free tier."),
		};
	return {
		...state,
		storage: state.storage - plan.billKb,
		gateBillKb: plan.billKb,
		planDowngraded: false,
		log: withLog(state, `Storage bill paid (-${plan.billKb}KB).`),
	};
};

const closeWindow = (closing: RunState, nextIndex: number): RunState => {
	const state = chargeStorageBill(closing);
	const gateNumber = state.gatesCleared;

	if (!gatePassed(state.pipeline, state.window, state.gatesCleared)) {
		const quota = dropCount(state.gatesCleared);
		const installed = state.pipeline.configs.length;
		// A fail the build cannot pay for ends the run (ADR-021). The quota grows
		// with depth, so from gate 4 a three-config build owes everything it holds —
		// and a build that pays that has nothing left to climb with. Peeling it bare
		// and playing on was a zombie window: ADR-017 makes a bare pipeline unable
		// to clear, so it could only ever end in this same death one gate later.
		if (quota >= installed)
			return {
				...state,
				currentIndex: nextIndex,
				status: "dead",
				log: withLog(state, fatalPeelLine(state, gateNumber, installed)),
			};
		return {
			...state,
			currentIndex: nextIndex,
			status: "awaiting-strip",
			stripsRemaining: quota,
			log: withLog(
				state,
				`Gate ${gateNumber} failed${failureCause(state)}. Peel ${quota} config${quota > 1 ? "s" : ""}.`
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
	// Passing the checks is the whole price of depth (ADR-019): a clear always
	// advances. Width is bought with coverage on its own ladder and never gates
	// the climb, so a run can sit at gate 2 on its starting three slots. What
	// makes depth expensive is risk — the demands escalate with it, and a build
	// too narrow to meet them dies rather than stalling.
	const cleared: RunState = {
		...state,
		window: EMPTY_WINDOW,
		manualDisabled: [],
		gatesCleared: state.gatesCleared + 1,
		clearedGate: gateNumber,
		storage: addStorage(state.storage, reward),
		gateRewardKb: reward,
		currentIndex: nextIndex,
	};

	if (gateNumber >= VICTORY_GATE)
		return {
			...cleared,
			status: "won",
			log: withLog(state, `${clearLine(gateNumber, reward)} You summited!`),
		};

	return {
		...cleared,
		draftOptions: rollDraft(draftSeed(gateNumber, 0), state.pipeline.configs),
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
			`${clearLine(gateNumber, reward)} Spend it in the shop.`
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
	// this answer settles whether the linted poll was answered correctly. The
	// *offer* is recorded alongside it: a poll this linter could have run on and
	// did not is a declined pledge (ADR-022), so the check needs to know the
	// chance existed. Read from the poll's own options rather than
	// `wrongStillOn`, which shrinks with each lint already spent here.
	const linter = linterFor(configs, poll.category);
	const couldLint =
		linter !== undefined &&
		poll.options.filter((option) => !option.correct).length > 1;
	const didLint = linter !== undefined && state.manualDisabled.length > 0;
	const lintedBefore = state.window.lintedByConfig ?? {};
	const lintedByConfig =
		linter && (couldLint || didLint)
			? {
					...lintedBefore,
					[linter.id]: {
						offered:
							(lintedBefore[linter.id]?.offered ?? 0) + (couldLint ? 1 : 0),
						polls: (lintedBefore[linter.id]?.polls ?? 0) + (didLint ? 1 : 0),
						correct:
							(lintedBefore[linter.id]?.correct ?? 0) +
							(didLint && correct ? 1 : 0),
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
		codeBlock: poll.codeBlock,
		explanation: poll.explanation,
		options: poll.options.map((option) => option.label),
		answerType: poll.answerType,
		coverageEarned: earned,
		coverageBreakdown,
		elapsedMs,
	};

	// The loss drains the poll's category (floored at 0) and the total moves by
	// what the category actually lost — total stays the sum of the categories,
	// and you can't lose coverage you don't have. window.coverageGained stays a
	// gains-only tally, so coverage-gain checks aren't double-punished.
	const coverage = roundToOneDecimal(
		Math.max(0, state.coverage + categoryAfter - categoryBefore)
	);
	const widened = autoWidenSlots(state.pipeline, coverage);

	const answered: RunState = {
		...state,
		window,
		manualDisabled: [],
		streak,
		storage: addStorage(state.storage, faucet),
		faucetEarnedKb: faucetEarnedBefore + faucet,
		faucetThisGateKb: (state.faucetThisGateKb ?? 0) + faucet,
		coverage,
		coverageByCategory: {
			...state.coverageByCategory,
			[poll.category]: categoryAfter,
		},
		pipeline: widened.pipeline,
		justUnlockedSlots: widened.justUnlocked.length
			? [...(state.justUnlockedSlots ?? []), ...widened.justUnlocked]
			: state.justUnlockedSlots,
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
	// An emptied build never climbs on. Only runs snapshotted before ADR-021 reach
	// this — their quota was capped at what the build held — and a bare pipeline
	// cannot clear a check (ADR-017), so the climb is already decided.
	if (isBare(state.pipeline))
		return {
			...state,
			status: "dead",
			log: withLog(state, "Nothing left in the pipeline — run over."),
		};
	return {
		...state,
		window: EMPTY_WINDOW,
		manualDisabled: [],
		faucetThisGateKb: 0,
		gateRewardKb: 0,
		gateBillKb: 0,
		planDowngraded: false,
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
 * Width is bought with coverage and nothing else (ADR-019): a slot buys room for
 * another config, never a gate. The climb's depth is settled by the checks, so
 * this stays a pure widening.
 */
/**
 * Width is bought with coverage alone (ADR-019), and now claims itself the
 * instant a threshold is met — no purchase step, so this just widens.
 */
const autoWidenSlots = (
	pipeline: Pipeline,
	coverage: number
): { pipeline: Pipeline; justUnlocked: readonly number[] } => {
	let slots = pipeline.slots;
	const justUnlocked: number[] = [];
	while (canAddSlot(slots, coverage)) {
		slots += 1;
		justUnlocked.push(slots);
	}
	return {
		pipeline: justUnlocked.length ? { ...pipeline, slots } : pipeline,
		justUnlocked,
	};
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

/**
 * Storage plans are a shop action like any other (DVTD-rf5c): switching is
 * free both ways, but a voluntary downgrade clamps on the spot — headroom you
 * stop paying for takes whatever sat in it. The shop names the burn before
 * the click; the reducer just collects it.
 */
const changePlan = (state: RunState, tier: number): RunState => {
	const current = storagePlanFor(state.storagePlan);
	const next = STORAGE_PLANS.find((plan) => plan.tier === tier);
	if (!next || next.tier === current.tier) return state;
	const clamped = Math.min(state.storage, next.capKb);
	const burned = state.storage - clamped;
	const upgradeLine = `Storage plan upgraded: ${next.capKb}KB cap for ${next.billKb}KB per gate.`;
	const downgradeLine = `Storage plan downgraded to a ${next.capKb}KB cap${
		burned > 0 ? ` — ${burned}KB over it burned` : ""
	}.`;
	return {
		...state,
		storagePlan: next.tier,
		storage: clamped,
		log: withLog(state, next.tier > current.tier ? upgradeLine : downgradeLine),
	};
};

/**
 * Leaving the shop is entering the next gate, and the gate grades its width
 * demand at the door (ADR-027): a build under `minConfigsForGate` could not
 * even pay the gate's stake, so entry is refused for good — the death ADR-021
 * says belongs to a gate. Only a strip can sink a build this low (the shop and
 * doorstep refuse voluntary thinning), so the charge always traces back to a
 * failed gate, and the shop names it in cinnabar before the click.
 */
const finishReward = (state: RunState): RunState => {
	const demanded = minConfigsForGate(state.gatesCleared);
	const installed = state.pipeline.configs.length;
	if (installed < demanded)
		return {
			...state,
			status: "dead",
			log: withLog(
				state,
				`Gate ${state.gatesCleared} demands ${demanded} configs — the build holds ${installed}. Run over.`
			),
		};
	return {
		...state,
		draftOptions: [],
		rebuildsUsed: 0,
		draftedThisGate: [],
		answeredThisGate: [],
		clearedChecks: [],
		faucetThisGateKb: 0,
		gateRewardKb: 0,
		gateBillKb: 0,
		planDowngraded: false,
		justUnlockedSlots: [],
		storage: Math.min(state.storage, storagePlanFor(state.storagePlan).capKb),
		status: "answering",
		log: withLog(state, "Climbing on."),
	};
};

const rebuildDraft = (state: RunState): RunState => {
	const cost = rebuildCost(state.rebuildsUsed);
	if (state.storage < cost) return state;
	const nextRebuilds = state.rebuildsUsed + 1;
	return {
		...state,
		storage: state.storage - cost,
		rebuildsUsed: nextRebuilds,
		draftOptions: rollDraft(
			draftSeed(state.gatesCleared, nextRebuilds),
			state.pipeline.configs
		),
		log: withLog(state, `Rebuilt the draft (-${cost}KB).`),
	};
};

/**
 * The build sits at (or under) the coming gate's width demand
 * (`minConfigsForGate`, ADR-027), so nothing may be voluntarily removed.
 * Generalizes ADR-021's last-config rule: thinning below the demand in the
 * shop or on the prep doorstep would hand the player an already-lost run
 * with no failed gate to justify it — death belongs to the gate. The early
 * gates demand less than one config, so the last-config rule stays the
 * hard bottom there.
 */
const atMinimumWidth = (state: RunState): boolean =>
	state.pipeline.configs.length <=
	Math.max(1, minConfigsForGate(state.gatesCleared));

const sell = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!target || atMinimumWidth(state)) return state;
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
	if (!target || atMinimumWidth(state)) return state;
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
	if (action.type === "pick-stack" && state.status === "configuring")
		return pickStack(state, action.stackId);
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
	if (action.type === "draft" && state.status === "rewarding")
		return draft(state, action.configId);
	if (action.type === "upgrade" && state.status === "rewarding")
		return upgrade(state, action.configId);
	if (action.type === "rebuild-draft" && state.status === "rewarding")
		return rebuildDraft(state);
	if (action.type === "finish-reward" && state.status === "rewarding")
		return finishReward(state);
	if (action.type === "change-plan" && state.status === "rewarding")
		return changePlan(state, action.tier);
	if (action.type === "sell" && state.status === "rewarding")
		return sell(state, action.configId);
	// While answering, drop is doorstep-only (window untouched): mid-window it
	// would shed the very check about to fail and re-derive the checklist
	// without it (ADR-027) — the gate grades the build it admitted.
	if (
		action.type === "drop" &&
		(state.status === "rewarding" ||
			(state.status === "answering" && state.window.answered === 0))
	)
		return drop(state, action.configId);
	return state;
};

export { checkStatuses, currentRequirement } from "../gate/gate.model";

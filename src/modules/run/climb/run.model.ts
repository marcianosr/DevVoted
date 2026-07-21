import type { CategoryCode } from "~/domains/shared/categories";

import {
	Pipeline,
	BASE_SLOTS,
	canAddSlot,
	canLint,
	type CoverageBreakdown,
	coverageBreakdownForAnswer,
	coverageForAnswer,
	freeConfigs,
	isBare,
	isFixed,
	rewardMultiplierFor,
	stripConfig,
} from "../pipeline/pipeline.model";
import {
	Config,
	draftCost,
	isUpgradable,
	sellRefund,
	upgradeCost,
	upgradeCoverageRequired,
} from "../configs/config.model";
import {
	type CheckStatus,
	EMPTY_WINDOW,
	GateWindow,
} from "../configs/effect.model";
import { DRAFT_SIZE, rebuildCost, rollDraft } from "../draft/draft.model";
import { checkStatuses, gateDemands, gatePassed } from "../gate/gate.model";
import {
	dropCount,
	GATE_REWARD_KB,
	roundToOneDecimal,
	SLICE_WINDOW,
	STORAGE_CAP_KB,
	streakMultiplier,
	VICTORY_GATE,
	WRONG_COVERAGE_LOSS,
} from "../rules.model";

export const LINT_COST = 40;

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
};

export type RunState = {
	readonly status: RunStatus;
	readonly pipeline: Pipeline;
	readonly available: readonly Config[];
	readonly draftOptions: readonly Config[];
	readonly rebuildsUsed: number;
	readonly draftedThisGate: readonly string[];
	readonly answeredThisGate: readonly AnsweredPoll[];
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
	readonly log: readonly string[];
};

export type RunAction =
	| { readonly type: "slot"; readonly configId: string }
	| { readonly type: "unslot"; readonly configId: string }
	| { readonly type: "start" }
	| { readonly type: "answer"; readonly optionIds: readonly string[] }
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
	handed: readonly Config[],
	fixed: readonly Config[] = []
): RunState => ({
	status: "configuring",
	pipeline: { id: "pipeline", slots: BASE_SLOTS, configs: fixed },
	available: handed,
	draftOptions: [],
	rebuildsUsed: 0,
	draftedThisGate: [],
	answeredThisGate: [],
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
	log: [],
});

export { gateDemands, canLint, rebuildCost };

const withLog = (state: RunState, ...lines: string[]): readonly string[] => [
	...state.log,
	...lines,
];
const isLastPoll = (state: RunState, nextIndex: number): boolean =>
	nextIndex >= state.polls.length;
const withPipeline = (
	pipeline: Pipeline,
	configs: readonly Config[]
): Pipeline => ({
	...pipeline,
	configs,
});

const slotConfig = (state: RunState, configId: string): RunState => {
	const config = state.available.find((candidate) => candidate.id === configId);
	if (!config || freeConfigs(state.pipeline).length >= state.pipeline.slots)
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
	if (!config || isFixed(config)) return state;
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
	const gateNumber = state.gatesCleared + 1;

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
			freeConfigs(state.pipeline).length
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

	const reward = Math.round(
		GATE_REWARD_KB * rewardMultiplierFor(state.pipeline)
	);
	const cleared: RunState = {
		...state,
		window: EMPTY_WINDOW,
		manualDisabled: [],
		gatesCleared: gateNumber,
		storage: addStorage(state.storage, reward),
		currentIndex: nextIndex,
	};

	if (gateNumber >= VICTORY_GATE)
		return {
			...cleared,
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
			`Gate ${gateNumber} cleared! +${reward}KB — spend it in the shop.`
		),
	};
};

const answer = (state: RunState, optionIds: readonly string[]): RunState => {
	if (optionIds.length === 0) return state;
	const poll = state.polls[state.currentIndex];

	const configs = state.pipeline.configs;
	const correct = isCorrect(poll, optionIds);
	const outcome = answerOutcome(poll, optionIds);
	const openingClean = state.window.leadingCorrect === state.window.answered;
	const share = coverageShare(poll, optionIds);
	// Streak updates first so this answer scores at its new level (a correct
	// reaching streak 3 earns at 1.3×). Then it multiplies the earn last.
	const streak = nextStreak(state.streak, outcome);
	const earned = coverageForAnswer(
		configs,
		poll.category,
		share,
		streakMultiplier(streak)
	);
	// A miss (share 0) bleeds coverage: base loss scaled by the build's reward
	// multiplier — risk cuts both ways. Raw rules only: coverage configs never
	// amplify a loss, and the gate never scales it.
	const coverageLoss =
		share > 0
			? 0
			: roundToOneDecimal(
					WRONG_COVERAGE_LOSS * rewardMultiplierFor(state.pipeline)
				);
	const coverageBreakdown = coverageBreakdownForAnswer(
		configs,
		poll.category,
		share,
		streakMultiplier(streak),
		coverageLoss
	);
	const categoryBefore = state.coverageByCategory[poll.category] ?? 0;
	const categoryAfter = roundToOneDecimal(
		Math.max(0, categoryBefore + earned - coverageLoss)
	);
	const faucet = correct
		? configs.reduce((sum, config) => sum + (config.storagePerCorrect ?? 0), 0)
		: 0;
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
			},
		},
	};

	const answered: RunState = {
		...state,
		window,
		manualDisabled: [],
		streak,
		storage: addStorage(state.storage, faucet),
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
		answeredThisGate: [
			...state.answeredThisGate,
			{
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
			},
		],
	};

	if (window.answered >= SLICE_WINDOW) return closeWindow(answered, nextIndex);
	return {
		...answered,
		currentIndex: nextIndex,
		status: isLastPoll(state, nextIndex) ? "won" : "answering",
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
	lintApplies(state) && state.storage >= LINT_COST;

const spendLint = (state: RunState): RunState => {
	if (!canRunLinter(state)) return state;
	return {
		...state,
		storage: state.storage - LINT_COST,
		manualDisabled: [...state.manualDisabled, wrongStillOn(state)[0].id],
		log: withLog(state, `Ran the linter (-${LINT_COST}KB).`),
	};
};

const strip = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(config) => config.id === configId
	);
	if (!target || isFixed(target) || state.stripsRemaining <= 0) return state;
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
		answeredThisGate: [],
		status: isLastPoll(state, state.currentIndex) ? "won" : "answering",
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

const addSlot = (state: RunState): RunState => {
	if (!canAddSlot(state.pipeline.slots, state.coverage)) return state;
	return stayReward(
		state,
		{ ...state.pipeline, slots: state.pipeline.slots + 1 },
		state.draftOptions,
		`Widened the pipeline to ${state.pipeline.slots + 1} slots.`
	);
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
		freeConfigs(state.pipeline).length >= state.pipeline.slots ||
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

	const cost = upgradeCost(level);
	if (state.storage < cost) return state;
	return {
		...stayReward(
			state,
			levelled,
			state.draftOptions,
			`Upgraded ${owned.label} to L${level + 1} (-${cost}KB).`
		),
		storage: state.storage - cost,
	};
};

const finishReward = (state: RunState): RunState => ({
	...state,
	draftOptions: [],
	rebuildsUsed: 0,
	draftedThisGate: [],
	answeredThisGate: [],
	clearedChecks: [],
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
	if (!target || isFixed(target)) return state;
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
	if (!target || isFixed(target)) return state;
	return {
		...state,
		pipeline: withPipeline(
			state.pipeline,
			state.pipeline.configs.filter((candidate) => candidate.id !== configId)
		),
		log: withLog(state, "Dropped a config to make room."),
	};
};

export const runReducer = (state: RunState, action: RunAction): RunState => {
	if (action.type === "slot" && state.status === "configuring")
		return slotConfig(state, action.configId);
	if (action.type === "unslot" && state.status === "configuring")
		return unslotConfig(state, action.configId);
	if (action.type === "start" && state.status === "configuring")
		return { ...state, status: "answering" };
	if (action.type === "answer" && state.status === "answering")
		return answer(state, action.optionIds);
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

import type { CategoryCode } from "~/domains/shared/categories";

import {
	Pipeline,
	BASE_SLOTS,
	canAddSlot,
	canLint,
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
	VICTORY_GATE,
} from "../rules.model";

export const LINT_COST = 40;

const addStorage = (current: number, income: number): number =>
	Math.min(current + income, STORAGE_CAP_KB);

export type SessionOption = {
	readonly id: string;
	readonly label: string;
	readonly correct: boolean;
};
export type AnswerType = "single" | "multiple";

export type SessionPoll = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly answerType: AnswerType;
	readonly options: readonly SessionOption[];
};

const isCorrect = (
	poll: SessionPoll,
	optionIds: readonly string[]
): boolean => {
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

export type SessionStatus =
	"configuring" | "answering" | "awaiting-strip" | "rewarding" | "won" | "dead";

export type AnsweredPoll = {
	readonly id: string;
	readonly question: string;
	readonly category: CategoryCode;
	readonly correct: boolean;
	readonly picked: readonly string[];
};

export type SessionState = {
	readonly status: SessionStatus;
	readonly pipeline: Pipeline;
	readonly available: readonly Config[];
	readonly draftOptions: readonly Config[];
	readonly rebuildsUsed: number;
	readonly draftedThisGate: readonly string[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	readonly clearedChecks: readonly CheckStatus[];
	readonly stripsRemaining: number;
	readonly polls: readonly SessionPoll[];
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

export type SessionAction =
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

export const createSession = (
	polls: readonly SessionPoll[],
	handed: readonly Config[],
	fixed: readonly Config[] = []
): SessionState => ({
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

const withLog = (
	state: SessionState,
	...lines: string[]
): readonly string[] => [...state.log, ...lines];
const isLastPoll = (state: SessionState, nextIndex: number): boolean =>
	nextIndex >= state.polls.length;
const withPipeline = (
	pipeline: Pipeline,
	configs: readonly Config[]
): Pipeline => ({
	...pipeline,
	configs,
});

const slotConfig = (state: SessionState, configId: string): SessionState => {
	const config = state.available.find((candidate) => candidate.id === configId);
	if (!config || freeConfigs(state.pipeline).length >= state.pipeline.slots)
		return state;
	return {
		...state,
		available: state.available.filter((candidate) => candidate.id !== configId),
		pipeline: withPipeline(state.pipeline, [...state.pipeline.configs, config]),
	};
};

const unslotConfig = (state: SessionState, configId: string): SessionState => {
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

const closeWindow = (state: SessionState, nextIndex: number): SessionState => {
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
	const cleared: SessionState = {
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
			`Gate ${gateNumber} cleared! +${reward}KB — take one reward.`
		),
	};
};

const answer = (
	state: SessionState,
	optionIds: readonly string[]
): SessionState => {
	if (optionIds.length === 0) return state;
	const poll = state.polls[state.currentIndex];

	const configs = state.pipeline.configs;
	const correct = isCorrect(poll, optionIds);
	const openingClean = state.window.leadingCorrect === state.window.answered;
	const earned = coverageForAnswer(configs, poll.category, correct);
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

	const answered: SessionState = {
		...state,
		window,
		manualDisabled: [],
		streak: correct ? state.streak + 1 : 0,
		storage: addStorage(state.storage, faucet),
		coverage: roundToOneDecimal(state.coverage + earned),
		coverageByCategory: {
			...state.coverageByCategory,
			[poll.category]: roundToOneDecimal(
				(state.coverageByCategory[poll.category] ?? 0) + earned
			),
		},
		answeredThisGate: [
			...state.answeredThisGate,
			{
				id: poll.id,
				question: poll.question,
				category: poll.category,
				correct,
				picked: poll.options
					.filter((option) => optionIds.includes(option.id))
					.map((option) => option.label),
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

const wrongStillOn = (state: SessionState) => {
	const poll = state.polls[state.currentIndex];
	const alreadyOff = new Set<string>(state.manualDisabled);
	return poll.options.filter(
		(option) => !option.correct && !alreadyOff.has(option.id)
	);
};

export const lintApplies = (state: SessionState): boolean => {
	const poll = state.polls[state.currentIndex];
	if (!poll || !canLint(state.pipeline.configs, poll.category)) return false;
	return wrongStillOn(state).length > 1;
};

export const canRunLinter = (state: SessionState): boolean =>
	lintApplies(state) && state.storage >= LINT_COST;

const spendLint = (state: SessionState): SessionState => {
	if (!canRunLinter(state)) return state;
	return {
		...state,
		storage: state.storage - LINT_COST,
		manualDisabled: [...state.manualDisabled, wrongStillOn(state)[0].id],
		log: withLog(state, `Ran the linter (-${LINT_COST}KB).`),
	};
};

const strip = (state: SessionState, configId: string): SessionState => {
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
const resumeClimb = (state: SessionState): SessionState => {
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
	state: SessionState,
	pipeline: Pipeline,
	draftOptions: readonly Config[],
	line: string
): SessionState => ({
	...state,
	pipeline,
	draftOptions,
	log: withLog(state, line),
});

const levelUp = (config: Config): Config => ({
	...config,
	level: (config.level ?? 1) + 1,
});

const addSlot = (state: SessionState): SessionState => {
	if (!canAddSlot(state.pipeline.slots, state.coverage)) return state;
	return stayReward(
		state,
		{ ...state.pipeline, slots: state.pipeline.slots + 1 },
		state.draftOptions,
		`Widened the pipeline to ${state.pipeline.slots + 1} slots.`
	);
};

const draft = (state: SessionState, configId: string): SessionState => {
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

const upgrade = (state: SessionState, configId: string): SessionState => {
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

const finishReward = (state: SessionState): SessionState => ({
	...state,
	draftOptions: [],
	rebuildsUsed: 0,
	draftedThisGate: [],
	answeredThisGate: [],
	clearedChecks: [],
	status: "answering",
	log: withLog(state, "Climbing on."),
});

const rebuildDraft = (state: SessionState): SessionState => {
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

const sell = (state: SessionState, configId: string): SessionState => {
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

const drop = (state: SessionState, configId: string): SessionState => {
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

export const sessionReducer = (
	state: SessionState,
	action: SessionAction
): SessionState => {
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

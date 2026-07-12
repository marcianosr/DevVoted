import type { CategoryCode } from "~/domains/shared/categories";

import {
	Pipeline,
	BASE_SLOTS,
	canLint,
	coverageForAnswer,
	disabledOptionIds,
	isBare,
	MAX_SLOTS,
	rewardMultiplierFor,
	stripConfig,
} from "../pipeline/pipeline.model";
import { Config, upgradeCost } from "../configs/config.model";
import { EMPTY_WINDOW, GateWindow } from "../configs/effect.model";
import { DRAFT_SIZE, rebuildCost, rollDraft } from "../draft/draft.model";
import { gateDemands, gatePassed } from "../gate/gate.model";
import {
	dropCount,
	GATE_REWARD_KB,
	SLICE_WINDOW,
	SPEED_MS,
	VICTORY_GATE,
} from "../rules.model";

export const LINT_COST = 40;

export type SessionOption = {
	readonly id: string;
	readonly label: string;
	readonly correct: boolean;
};
/** Mirrors the schema's `answer_type`. */
export type AnswerType = "single" | "multiple";

export type SessionPoll = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly answerType: AnswerType;
	readonly options: readonly SessionOption[];
};

/**
 * The server's verdict on an answer. Single: exactly the one correct option.
 * Multiple: the selected set must equal the correct set exactly (all correct, no extras).
 */
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

export type SessionState = {
	readonly status: SessionStatus;
	readonly pipeline: Pipeline;
	readonly available: readonly Config[];
	readonly draftOptions: readonly Config[];
	readonly rebuildsUsed: number;
	/** Ids drafted since this reward screen opened — surfaced as "new" pipeline rows. */
	readonly draftedThisGate: readonly string[];
	/** Configs still to peel on the current failure. */
	readonly stripsRemaining: number;
	readonly polls: readonly SessionPoll[];
	readonly currentIndex: number;
	readonly window: GateWindow;
	/** Option ids the player paid to lint off the current poll (resets each poll). */
	readonly manualDisabled: readonly string[];
	readonly gatesCleared: number;
	readonly coverage: number;
	readonly storage: number;
	readonly log: readonly string[];
};

export type SessionAction =
	| { readonly type: "slot"; readonly configId: string }
	| { readonly type: "unslot"; readonly configId: string }
	| { readonly type: "start" }
	| {
			readonly type: "answer";
			readonly optionIds: readonly string[];
			readonly elapsedMs?: number;
	  }
	| { readonly type: "lint-poll" }
	| { readonly type: "strip"; readonly configId: string }
	| { readonly type: "add-slot" }
	| { readonly type: "draft"; readonly configId: string }
	| { readonly type: "upgrade"; readonly configId: string }
	| { readonly type: "rebuild-draft" }
	| { readonly type: "finish-reward" }
	| { readonly type: "drop"; readonly configId: string };

export const createSession = (
	polls: readonly SessionPoll[],
	handed: readonly Config[]
): SessionState => ({
	status: "configuring",
	pipeline: { id: "pipeline", slots: BASE_SLOTS, configs: [] },
	available: handed,
	draftOptions: [],
	rebuildsUsed: 0,
	draftedThisGate: [],
	stripsRemaining: 0,
	polls,
	currentIndex: 0,
	window: EMPTY_WINDOW,
	manualDisabled: [],
	gatesCleared: 0,
	coverage: 0,
	storage: 0,
	log: [],
});

export { gateDemands, canLint, disabledOptionIds, rebuildCost };
export { SPEED_MS } from "../rules.model";

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
	if (!config || state.pipeline.configs.length >= state.pipeline.slots)
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

	const reward = Math.round(
		GATE_REWARD_KB * rewardMultiplierFor(state.pipeline)
	);
	const cleared: SessionState = {
		...state,
		window: EMPTY_WINDOW,
		manualDisabled: [],
		gatesCleared: gateNumber,
		storage: state.storage + reward,
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
		status: "rewarding",
		log: withLog(
			state,
			`Gate ${gateNumber} cleared! +${reward}KB — take one reward.`
		),
	};
};

const answer = (
	state: SessionState,
	optionIds: readonly string[],
	elapsedMs?: number
): SessionState => {
	if (optionIds.length === 0) return state;
	const poll = state.polls[state.currentIndex];

	const configs = state.pipeline.configs;
	const correct = isCorrect(poll, optionIds);
	const fast = elapsedMs !== undefined && elapsedMs <= SPEED_MS;
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
		fast: state.window.fast + (fast ? 1 : 0),
		coverageGained:
			Math.round((state.window.coverageGained + earned) * 10) / 10,
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
		storage: state.storage + faucet,
		coverage: Math.round((state.coverage + earned) * 10) / 10,
	};

	if (window.answered >= SLICE_WINDOW) return closeWindow(answered, nextIndex);
	return {
		...answered,
		currentIndex: nextIndex,
		status: isLastPoll(state, nextIndex) ? "won" : "answering",
	};
};

const spendLint = (state: SessionState): SessionState => {
	if (!canLint(state.pipeline.configs) || state.storage < LINT_COST)
		return state;
	const poll = state.polls[state.currentIndex];
	const alreadyOff = new Set<string>([
		...disabledOptionIds(state.pipeline.configs, poll.category, poll.options),
		...state.manualDisabled,
	]);
	const remainingWrong = poll.options.filter(
		(option) => !option.correct && !alreadyOff.has(option.id)
	);
	if (remainingWrong.length <= 1) return state;
	return {
		...state,
		storage: state.storage - LINT_COST,
		manualDisabled: [...state.manualDisabled, remainingWrong[0].id],
		log: withLog(state, `Ran the linter (-${LINT_COST}KB).`),
	};
};

const strip = (state: SessionState, configId: string): SessionState => {
	if (!state.pipeline.configs.some((config) => config.id === configId))
		return state;
	const pipeline = stripConfig(state.pipeline, configId);
	const remaining = state.stripsRemaining - 1;
	if (remaining > 0 && pipeline.configs.length > 0)
		return {
			...state,
			pipeline,
			stripsRemaining: remaining,
			log: withLog(state, `Peeled a config. ${remaining} more to drop.`),
		};
	return {
		...state,
		pipeline,
		window: EMPTY_WINDOW,
		manualDisabled: [],
		stripsRemaining: 0,
		status: isLastPoll(state, state.currentIndex) ? "won" : "answering",
		log: withLog(state, `Peeled a config. ${pipeline.configs.length} left.`),
	};
};

/** A reward action that keeps the player on the reward screen so they can take several. */
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
	if (state.pipeline.slots >= MAX_SLOTS) return state;
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
	const owned = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	const remaining = state.draftOptions.filter(
		(candidate) => candidate.id !== configId
	);
	if (owned?.focusCategory)
		return stayReward(
			state,
			withPipeline(
				state.pipeline,
				state.pipeline.configs.map((config) =>
					config.id === configId ? levelUp(config) : config
				)
			),
			remaining,
			`Upgraded ${chosen.label} to L${(owned.level ?? 1) + 1}.`
		);
	if (!owned && state.pipeline.configs.length < state.pipeline.slots)
		return {
			...stayReward(
				state,
				withPipeline(state.pipeline, [...state.pipeline.configs, chosen]),
				remaining,
				`Drafted ${chosen.label}.`
			),
			draftedThisGate: [...state.draftedThisGate, chosen.id],
		};
	return state;
};

const upgrade = (state: SessionState, configId: string): SessionState => {
	const owned = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!owned || !owned.focusCategory) return state;
	const cost = upgradeCost(owned.level ?? 1);
	if (state.storage < cost) return state;
	return {
		...stayReward(
			state,
			withPipeline(
				state.pipeline,
				state.pipeline.configs.map((config) =>
					config.id === configId ? levelUp(config) : config
				)
			),
			state.draftOptions,
			`Upgraded ${owned.label} to L${(owned.level ?? 1) + 1} (-${cost}KB).`
		),
		storage: state.storage - cost,
	};
};

/** Leave the reward screen and climb on — the explicit "Next" step. */
const finishReward = (state: SessionState): SessionState => ({
	...state,
	draftOptions: [],
	rebuildsUsed: 0,
	draftedThisGate: [],
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

const drop = (state: SessionState, configId: string): SessionState => {
	if (!state.pipeline.configs.some((candidate) => candidate.id === configId))
		return state;
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
		return answer(state, action.optionIds, action.elapsedMs);
	if (action.type === "lint-poll" && state.status === "answering")
		return spendLint(state);
	if (action.type === "strip" && state.status === "awaiting-strip")
		return strip(state, action.configId);
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
	if (action.type === "drop" && state.status === "rewarding")
		return drop(state, action.configId);
	return state;
};

export { checkStatuses, currentRequirement } from "../gate/gate.model";

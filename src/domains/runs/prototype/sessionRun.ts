/**
 * Session-run state machine for the vertical-slice prototype (DVTD-88si).
 *
 * One board — you stack configs onto a single pipeline. The gate always has a baseline
 * correct-answers check; check-configs (Coverage/Cold Start/Speed/Mirrored) and Focus
 * configs each add another condition to the SAME 5-poll window. A gate passes only if
 * EVERY check passes. Harder conditions pay a bigger reward multiplier (harder = richer).
 *
 * Pass → pick one reward (draft a config / add a slot / upgrade a Focus config).
 * Fail → drop N configs (N climbs with the gate). Fail while bare → the run ends.
 * Summit at VICTORY_GATE.
 */
import type { CategoryCode } from "~/domains/shared/categories";

import {
	coverageForAnswer,
	effectiveRequirement,
	MAX_SLOTS_PER_PIPELINE,
	Pipeline,
	rewardMultiplierFor,
	SLICE_SLOT_CAPACITY,
	SLICE_TAGS,
	stripSticker,
	Tag,
} from "./sessionSlice";

/** Polls per gate. Small so each gate is one ~2-min daily sitting. */
export const SLICE_WINDOW = 5;
/** Correct answers a bare gate demands before check-configs and escalation. Starts trivially easy — you stack the difficulty yourself. */
export const CLIMB_BASE_REQUIREMENT = 1;
/** Clear this many gates to summit the run. */
export const VICTORY_GATE = 5;
/** Flavor reward per cleared gate (KB), multiplied by Risk + Check configs. */
const GATE_REWARD_KB = 120;
/** Configs offered in a between-gate draft. */
const DRAFT_SIZE = 3;
/** An answer at or under this many ms counts as "fast" for the Speed check. */
export const SPEED_MS = 4000;
/** Storage cost (KB) of a draft rebuild IS the Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21, 34, … */
const REBUILD_FIB_KB = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
export const rerollCost = (rebuildsUsed: number): number =>
	REBUILD_FIB_KB[rebuildsUsed] ?? REBUILD_FIB_KB[REBUILD_FIB_KB.length - 1];
/** Storage cost to manually lint a wrong option off the current poll (needs a linter config equipped). */
export const LINT_COST = 40;

const ALL_TAGS: readonly Tag[] = Object.values(SLICE_TAGS);

export type SliceOption = {
	readonly id: string;
	readonly label: string;
	readonly correct: boolean;
};

export type SlicePoll = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly options: readonly SliceOption[];
};

export type SessionStatus =
	"configuring" | "answering" | "awaiting-strip" | "rewarding" | "won" | "dead";

/** Per-category tally for the current window, feeding the category-mastery check. */
export type CategoryTally = { readonly seen: number; readonly correct: number };

export type SessionState = {
	readonly status: SessionStatus;
	readonly pipeline: Pipeline;
	readonly available: readonly Tag[];
	readonly draftOptions: readonly Tag[];
	readonly rerollsUsed: number;
	/** Configs still to peel on the current failure (drop count climbs with the gate). */
	readonly stripsRemaining: number;
	readonly polls: readonly SlicePoll[];
	readonly currentIndex: number;
	readonly windowCorrect: number;
	readonly windowAnswered: number;
	/** Fast answers this window (feeds the Speed check). */
	readonly windowFast: number;
	readonly windowByCategory: Readonly<Record<string, CategoryTally>>;
	readonly windowCoverageGained: number;
	/** Leading correct answers from the window's start (for cold-start). */
	readonly windowLeadingCorrect: number;
	/** True until the first wrong answer this window (freezes the cold-start count). */
	readonly windowOpeningOpen: boolean;
	/** Option ids the player paid to lint off the current poll (resets each poll). */
	readonly manualDisabled: readonly string[];
	readonly gatesCleared: number;
	readonly coverage: number;
	readonly storage: number;
	readonly log: readonly string[];
};

export type SessionAction =
	| { readonly type: "slot"; readonly tagId: string }
	| { readonly type: "unslot"; readonly tagId: string }
	| { readonly type: "start" }
	| {
			readonly type: "answer";
			readonly optionId: string;
			readonly elapsedMs?: number;
	  }
	| { readonly type: "lint-poll" }
	| { readonly type: "strip"; readonly tagId: string }
	| { readonly type: "add-slot" }
	| { readonly type: "draft"; readonly tagId: string }
	| { readonly type: "upgrade"; readonly tagId: string }
	| { readonly type: "reroll-draft" }
	| { readonly type: "skip-reward" }
	| { readonly type: "drop"; readonly tagId: string };

const FRESH_WINDOW = {
	windowCorrect: 0,
	windowAnswered: 0,
	windowFast: 0,
	windowByCategory: {},
	windowCoverageGained: 0,
	windowLeadingCorrect: 0,
	windowOpeningOpen: true,
	manualDisabled: [],
} as const;

export const createSession = (
	polls: readonly SlicePoll[],
	handedTags: readonly Tag[]
): SessionState => ({
	status: "configuring",
	pipeline: { id: "pipeline", slots: SLICE_SLOT_CAPACITY, tags: [] },
	available: handedTags,
	draftOptions: [],
	rerollsUsed: 0,
	stripsRemaining: 0,
	polls,
	currentIndex: 0,
	...FRESH_WINDOW,
	gatesCleared: 0,
	coverage: 0,
	storage: 0,
	log: [],
});

/** Gates get harder as you climb: +1 to every threshold every two gates cleared. */
const escalation = (gatesCleared: number): number =>
	Math.floor(gatesCleared / 2);

/** Configs you must peel on a failure — climbs with the gate. */
export const dropCount = (gatesCleared: number): number =>
	1 + Math.floor(gatesCleared / 2);

/** The baseline correct-answers requirement for the current gate, after Risk configs. */
export const currentRequirement = (state: SessionState): number =>
	effectiveRequirement(
		state.pipeline,
		CLIMB_BASE_REQUIREMENT + escalation(state.gatesCleared)
	);

/** Whether a linter config (ESLint/Stylelint/…) is equipped — unlocks the on-demand lint button. */
export const hasLinter = (tags: readonly Tag[]): boolean =>
	tags.some((tag) => tag.eliminatesWrongOptionsFor);

/** Correct answers a Focus config demands in its category this window (scales with level). */
export const focusDemand = (tag: Tag): number => tag.level ?? 1;

export type CheckStatus = {
	readonly label: string;
	readonly progress: string;
	readonly met: boolean;
};

/** Wrong answers this window (the Mirrored lens). */
const windowWrong = (state: SessionState): number =>
	state.windowAnswered - state.windowCorrect;

/**
 * Every check the gate imposes right now, with live progress. The gate passes iff all are met.
 * Baseline correct-answers first, then each check-config's condition and each Focus commitment.
 */
export const checkStatuses = (state: SessionState): readonly CheckStatus[] => {
	const baseline = currentRequirement(state);
	const statuses: CheckStatus[] = [
		{
			label: "Correct",
			progress: `${state.windowCorrect}/${baseline}`,
			met: state.windowCorrect >= baseline,
		},
	];

	for (const tag of state.pipeline.tags) {
		if (tag.check === "coverage-gain") {
			const threshold = (tag.checkAmount ?? 0) + escalation(state.gatesCleared);
			statuses.push({
				label: "Coverage",
				progress: `${state.windowCoverageGained}%/${threshold}%`,
				met: state.windowCoverageGained >= threshold,
			});
		}
		if (tag.check === "cold-start") {
			const amount = tag.checkAmount ?? 0;
			statuses.push({
				label: "Cold start",
				progress: `${state.windowLeadingCorrect}/${amount}`,
				met: state.windowLeadingCorrect >= amount,
			});
		}
		if (tag.check === "speed") {
			const amount = tag.checkAmount ?? 0;
			statuses.push({
				label: "Speed",
				progress: `${state.windowFast}/${amount} fast`,
				met: state.windowFast >= amount,
			});
		}
		if (tag.check === "mirrored") {
			const amount = tag.checkAmount ?? 0;
			statuses.push({
				label: "Mirrored",
				progress: `${windowWrong(state)}/${amount} wrong`,
				met: windowWrong(state) >= amount,
			});
		}
		if (tag.focusCategory) {
			const tally = state.windowByCategory[tag.focusCategory] ?? {
				seen: 0,
				correct: 0,
			};
			const need = focusDemand(tag);
			statuses.push({
				label: `${tag.label} mastery`,
				progress: tally.seen === 0 ? "not seen" : `${tally.correct}/${need}`,
				met: tally.seen === 0 || tally.correct >= need,
			});
		}
	}

	return statuses;
};

export const gatePassed = (state: SessionState): boolean =>
	checkStatuses(state).every((check) => check.met);

/** The gate's demands as readable bullet lines (no live progress) — a summary of what the current build imposes. */
export const gateDemands = (state: SessionState): readonly string[] => {
	const correct = currentRequirement(state);
	const demands: string[] = [
		`${correct} correct answer${correct === 1 ? "" : "s"}`,
	];
	for (const tag of state.pipeline.tags) {
		if (tag.check === "coverage-gain")
			demands.push(
				`+${(tag.checkAmount ?? 0) + escalation(state.gatesCleared)}% coverage this window`
			);
		if (tag.check === "cold-start")
			demands.push(`your first ${tag.checkAmount ?? 0} answers correct`);
		if (tag.check === "speed")
			demands.push(`${tag.checkAmount ?? 0} fast answers`);
		if (tag.check === "mirrored")
			demands.push(`${tag.checkAmount ?? 0} WRONG answers (inverted)`);
		if (tag.focusCategory)
			demands.push(
				`${tag.label}: get one right if ${tag.focusCategory} appears`
			);
	}
	return demands;
};

/** Wrong-option ids a Defense linter crosses out (disabled, still shown). Always leaves ≥1 wrong so it stays a real choice. */
export const disabledOptionIds = (
	tags: readonly Tag[],
	poll: SlicePoll
): ReadonlySet<string> => {
	const eliminations = tags.filter((tag) =>
		tag.eliminatesWrongOptionsFor?.includes(poll.category)
	).length;
	if (eliminations === 0) return new Set();
	const wrongIds = poll.options
		.filter((option) => !option.correct)
		.map((option) => option.id);
	return new Set(
		wrongIds.slice(0, Math.min(eliminations, Math.max(0, wrongIds.length - 1)))
	);
};

/** Deterministic draft: rotate the tag pool by gate. Includes owned Focus configs (as upgrades), excludes owned non-Focus. */
const rollDraft = (seed: number, equipped: readonly Tag[]): readonly Tag[] => {
	const ownedNonFocus = new Set(
		equipped.filter((tag) => !tag.focusCategory).map((tag) => tag.id)
	);
	const pool = ALL_TAGS.filter((tag) => !ownedNonFocus.has(tag.id));
	return Array.from(
		{ length: Math.min(DRAFT_SIZE, pool.length) },
		(_, offset) => pool[(seed + offset) % pool.length]
	);
};

const withLog = (
	state: SessionState,
	...lines: string[]
): readonly string[] => [...state.log, ...lines];

const isLastPoll = (state: SessionState, nextIndex: number): boolean =>
	nextIndex >= state.polls.length;

const slotTag = (state: SessionState, tagId: string): SessionState => {
	const tag = state.available.find((candidate) => candidate.id === tagId);
	if (!tag || state.pipeline.tags.length >= state.pipeline.slots) return state;
	return {
		...state,
		available: state.available.filter((candidate) => candidate.id !== tagId),
		pipeline: { ...state.pipeline, tags: [...state.pipeline.tags, tag] },
	};
};

const unslotTag = (state: SessionState, tagId: string): SessionState => {
	const tag = state.pipeline.tags.find((candidate) => candidate.id === tagId);
	if (!tag) return state;
	return {
		...state,
		available: [...state.available, tag],
		pipeline: {
			...state.pipeline,
			tags: state.pipeline.tags.filter((candidate) => candidate.id !== tagId),
		},
	};
};

/** Applies a resolved gate: summit, reward, strip, or death. Passes iff every check is met. */
const closeWindow = (state: SessionState, nextIndex: number): SessionState => {
	const gateNumber = state.gatesCleared + 1;

	if (!gatePassed(state)) {
		if (state.pipeline.tags.length === 0)
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
			state.pipeline.tags.length
		);
		const failed = checkStatuses(state).find((check) => !check.met);
		return {
			...state,
			currentIndex: nextIndex,
			status: "awaiting-strip",
			stripsRemaining: toDrop,
			log: withLog(
				state,
				`Gate ${gateNumber} failed (${failed?.label} ${failed?.progress}). Peel ${toDrop} config${toDrop > 1 ? "s" : ""}.`
			),
		};
	}

	const reward = Math.round(
		GATE_REWARD_KB * rewardMultiplierFor(state.pipeline)
	);
	const cleared: SessionState = {
		...state,
		...FRESH_WINDOW,
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
		draftOptions: rollDraft(gateNumber, state.pipeline.tags),
		rerollsUsed: 0,
		status: "rewarding",
		log: withLog(
			state,
			`Gate ${gateNumber} cleared! +${reward}KB — take one reward.`
		),
	};
};

const answer = (
	state: SessionState,
	optionId: string,
	elapsedMs?: number
): SessionState => {
	const poll = state.polls[state.currentIndex];
	const option = poll.options.find((candidate) => candidate.id === optionId);
	if (!option) return state;

	const tags = state.pipeline.tags;
	const correct = option.correct;
	const fast = elapsedMs !== undefined && elapsedMs <= SPEED_MS;
	const nextIndex = state.currentIndex + 1;
	const tally = state.windowByCategory[poll.category] ?? {
		seen: 0,
		correct: 0,
	};
	const earned = coverageForAnswer(tags, poll.category, correct);
	const faucet = correct
		? tags.reduce((sum, tag) => sum + (tag.storagePerCorrect ?? 0), 0)
		: 0;
	const answered: SessionState = {
		...state,
		storage: state.storage + faucet,
		coverage: Math.round((state.coverage + earned) * 10) / 10,
		windowCorrect: state.windowCorrect + (correct ? 1 : 0),
		windowAnswered: state.windowAnswered + 1,
		windowFast: state.windowFast + (fast ? 1 : 0),
		windowByCategory: {
			...state.windowByCategory,
			[poll.category]: {
				seen: tally.seen + 1,
				correct: tally.correct + (correct ? 1 : 0),
			},
		},
		windowCoverageGained:
			Math.round((state.windowCoverageGained + earned) * 10) / 10,
		windowLeadingCorrect:
			state.windowOpeningOpen && correct
				? state.windowLeadingCorrect + 1
				: state.windowLeadingCorrect,
		windowOpeningOpen: state.windowOpeningOpen && correct,
		manualDisabled: [],
	};

	if (answered.windowAnswered >= SLICE_WINDOW)
		return closeWindow(answered, nextIndex);

	return {
		...answered,
		currentIndex: nextIndex,
		status: isLastPoll(state, nextIndex) ? "won" : "answering",
	};
};

const spendLint = (state: SessionState): SessionState => {
	if (!hasLinter(state.pipeline.tags) || state.storage < LINT_COST)
		return state;
	const poll = state.polls[state.currentIndex];
	const alreadyOff = new Set<string>([
		...disabledOptionIds(state.pipeline.tags, poll),
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

/** Peel one config on a failure. When the drop quota is met, resume; if it emptied the build, the next fail is fatal. */
const strip = (state: SessionState, tagId: string): SessionState => {
	if (!state.pipeline.tags.some((tag) => tag.id === tagId)) return state;
	const pipeline = stripSticker(state.pipeline, tagId);
	const remaining = state.stripsRemaining - 1;

	if (remaining > 0 && pipeline.tags.length > 0)
		return {
			...state,
			pipeline,
			stripsRemaining: remaining,
			log: withLog(state, `Peeled a config. ${remaining} more to drop.`),
		};

	return {
		...state,
		pipeline,
		...FRESH_WINDOW,
		stripsRemaining: 0,
		status: isLastPoll(state, state.currentIndex) ? "won" : "answering",
		log: withLog(state, `Peeled a config. ${pipeline.tags.length} left.`),
	};
};

const resumeFromReward = (
	state: SessionState,
	pipeline: Pipeline,
	extraLog: string
): SessionState => ({
	...state,
	pipeline,
	draftOptions: [],
	rerollsUsed: 0,
	status: "answering",
	log: withLog(state, extraLog),
});

const levelUp = (tag: Tag): Tag => ({ ...tag, level: (tag.level ?? 1) + 1 });

/** Reward: widen the board by a slot. */
const addSlot = (state: SessionState): SessionState => {
	if (state.pipeline.slots >= MAX_SLOTS_PER_PIPELINE) return state;
	return resumeFromReward(
		state,
		{ ...state.pipeline, slots: state.pipeline.slots + 1 },
		`Widened the board to ${state.pipeline.slots + 1} slots.`
	);
};

/** Reward: slot a drafted config (or upgrade it if it's a Focus dupe). */
const draft = (state: SessionState, tagId: string): SessionState => {
	const chosen = state.draftOptions.find((candidate) => candidate.id === tagId);
	if (!chosen) return state;

	const owned = state.pipeline.tags.find((candidate) => candidate.id === tagId);
	if (owned?.focusCategory)
		return resumeFromReward(
			state,
			{
				...state.pipeline,
				tags: state.pipeline.tags.map((tag) =>
					tag.id === tagId ? levelUp(tag) : tag
				),
			},
			`Upgraded ${chosen.label} to L${(owned.level ?? 1) + 1}.`
		);

	if (!owned && state.pipeline.tags.length < state.pipeline.slots)
		return resumeFromReward(
			state,
			{ ...state.pipeline, tags: [...state.pipeline.tags, chosen] },
			`Drafted ${chosen.label}.`
		);

	return state;
};

/** Reward: level up a Focus config already equipped, no draft needed. */
const upgrade = (state: SessionState, tagId: string): SessionState => {
	const owned = state.pipeline.tags.find((candidate) => candidate.id === tagId);
	if (!owned || !owned.focusCategory) return state;
	return resumeFromReward(
		state,
		{
			...state.pipeline,
			tags: state.pipeline.tags.map((tag) =>
				tag.id === tagId ? levelUp(tag) : tag
			),
		},
		`Upgraded ${owned.label} to L${(owned.level ?? 1) + 1}.`
	);
};

const skipReward = (state: SessionState): SessionState =>
	resumeFromReward(state, state.pipeline, "Skipped the reward.");

const rerollDraft = (state: SessionState): SessionState => {
	const cost = rerollCost(state.rerollsUsed);
	if (state.storage < cost) return state;
	const nextRerolls = state.rerollsUsed + 1;
	return {
		...state,
		storage: state.storage - cost,
		rerollsUsed: nextRerolls,
		draftOptions: rollDraft(
			state.gatesCleared + nextRerolls * DRAFT_SIZE,
			state.pipeline.tags
		),
		log: withLog(state, `Rebuilt the draft (-${cost}KB).`),
	};
};

/** Voluntarily drop a config during a reward to free a slot for a stronger one. */
const drop = (state: SessionState, tagId: string): SessionState => {
	if (!state.pipeline.tags.some((candidate) => candidate.id === tagId))
		return state;
	return {
		...state,
		pipeline: {
			...state.pipeline,
			tags: state.pipeline.tags.filter((candidate) => candidate.id !== tagId),
		},
		log: withLog(state, "Dropped a config to make room."),
	};
};

export const sessionReducer = (
	state: SessionState,
	action: SessionAction
): SessionState => {
	if (action.type === "slot" && state.status === "configuring")
		return slotTag(state, action.tagId);
	if (action.type === "unslot" && state.status === "configuring")
		return unslotTag(state, action.tagId);
	if (action.type === "start" && state.status === "configuring")
		return { ...state, status: "answering" };
	if (action.type === "answer" && state.status === "answering")
		return answer(state, action.optionId, action.elapsedMs);
	if (action.type === "lint-poll" && state.status === "answering")
		return spendLint(state);
	if (action.type === "strip" && state.status === "awaiting-strip")
		return strip(state, action.tagId);
	if (action.type === "add-slot" && state.status === "rewarding")
		return addSlot(state);
	if (action.type === "draft" && state.status === "rewarding")
		return draft(state, action.tagId);
	if (action.type === "upgrade" && state.status === "rewarding")
		return upgrade(state, action.tagId);
	if (action.type === "reroll-draft" && state.status === "rewarding")
		return rerollDraft(state);
	if (action.type === "skip-reward" && state.status === "rewarding")
		return skipReward(state);
	if (action.type === "drop" && state.status === "rewarding")
		return drop(state, action.tagId);
	return state;
};

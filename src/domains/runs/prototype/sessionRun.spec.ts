import { describe, expect, it } from "vitest";

import {
	checkStatuses,
	createSession,
	currentRequirement,
	disabledOptionIds,
	dropCount,
	hasLinter,
	sessionReducer,
	SessionState,
	SLICE_WINDOW,
	SlicePoll,
	SPEED_MS,
	VICTORY_GATE,
} from "./sessionRun";
import { SLICE_TAGS } from "./sessionSlice";
import type { CategoryCode } from "~/shared/lib/categories";

const poll = (
	id: string,
	correct: boolean,
	category: CategoryCode = "react"
): SlicePoll => ({
	id,
	category,
	question: `Is ${id} a good idea?`,
	options: [
		{ id: `${id}-a`, label: "Yes", correct },
		{ id: `${id}-b`, label: "No", correct: !correct },
	],
});

const triPoll = (category: CategoryCode): SlicePoll => ({
	id: "tri",
	category,
	question: "Which one?",
	options: [
		{ id: "a", label: "A", correct: true },
		{ id: "b", label: "B", correct: false },
		{ id: "c", label: "C", correct: false },
	],
});

const pool = (size: number): SlicePoll[] =>
	Array.from({ length: size }, (_, index) => poll(`poll-${index}`, true));

const handed = [
	SLICE_TAGS.js,
	SLICE_TAGS.eslint,
	SLICE_TAGS.pushForce,
	SLICE_TAGS.deployFriday,
	SLICE_TAGS.ts,
	SLICE_TAGS.indexedDb,
	SLICE_TAGS.coverageGain,
	SLICE_TAGS.coldStart,
	SLICE_TAGS.speed,
	SLICE_TAGS.mirrored,
];

const tagIds = (state: SessionState): string[] =>
	state.pipeline.tags.map((tag) => tag.id);

const answerWith = (
	state: SessionState,
	correct: boolean,
	elapsedMs?: number
): SessionState => {
	const current = state.polls[state.currentIndex];
	const option = current.options.find(
		(candidate) => candidate.correct === correct
	);
	if (!option) throw new Error("no matching option");
	return sessionReducer(state, {
		type: "answer",
		optionId: option.id,
		elapsedMs,
	});
};

const started = (slotIds: string[], size = 60): SessionState => {
	let state = createSession(pool(size), handed);
	for (const tagId of slotIds)
		state = sessionReducer(state, { type: "slot", tagId });
	return sessionReducer(state, { type: "start" });
};

const clearGate = (state: SessionState): SessionState => {
	let next = state;
	for (let i = 0; i < SLICE_WINDOW; i++) next = answerWith(next, true);
	return next.status === "rewarding"
		? sessionReducer(next, { type: "skip-reward" })
		: next;
};

describe("configuring", () => {
	it("refuses to slot beyond the board's slots — forcing the cut", () => {
		let state = createSession(pool(60), handed);
		for (const tagId of ["js", "ts", "push-force", "deploy-friday"])
			state = sessionReducer(state, { type: "slot", tagId });
		expect(state.pipeline.tags).toHaveLength(3);
	});

	it("starts with one board of 3 slots", () => {
		const state = createSession(pool(60), handed);
		expect(state.pipeline.slots).toBe(3);
		expect(state.pipeline.tags).toHaveLength(0);
	});
});

describe("gates and escalation", () => {
	it("clears a gate into the reward screen and grants storage", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.gatesCleared).toBe(1);
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(120);
	});

	it("doubles the reward with a Risk config", () => {
		let state = started(["push-force"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.storage).toBe(240);
	});

	it("starts at 1 correct and raises the baseline as the climb deepens", () => {
		const gate1 = started([]);
		expect(currentRequirement(gate1)).toBe(1);
		const gate3 = clearGate(clearGate(gate1)); // 2 gates cleared → +1 escalation
		expect(currentRequirement(gate3)).toBe(2);
	});
});

describe("check-configs — stacked gate conditions on one board", () => {
	it("fails when a Coverage check is unmet even though correct-count is met", () => {
		let state = started(["coverage-gain"]); // needs +4% coverage AND 3 correct
		for (let i = 0; i < 3; i++) state = answerWith(state, true); // 3 correct, +3% coverage
		for (let i = 0; i < 2; i++) state = answerWith(state, false);
		expect(state.status).toBe("awaiting-strip");
	});

	it("passes when correct-count and Coverage are both met", () => {
		let state = started(["coverage-gain"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true); // 5 correct, +5% coverage
		expect(state.gatesCleared).toBe(1);
	});

	it("fails a Cold Start check when the opening isn't clean", () => {
		let state = started(["cold-start"]);
		state = answerWith(state, false); // opening broken immediately
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		expect(state.status).toBe("awaiting-strip");
	});

	it("passes a Speed check when enough answers are fast", () => {
		let state = started(["speed"]); // needs 2 fast + 3 correct
		state = answerWith(state, true, SPEED_MS - 100);
		state = answerWith(state, true, SPEED_MS - 100);
		state = answerWith(state, true, SPEED_MS + 5000);
		state = answerWith(state, true, SPEED_MS + 5000);
		state = answerWith(state, true, SPEED_MS + 5000);
		expect(state.gatesCleared).toBe(1);
	});

	it("fails a Speed check when answers are too slow", () => {
		let state = started(["speed"]);
		for (let i = 0; i < SLICE_WINDOW; i++)
			state = answerWith(state, true, SPEED_MS + 5000);
		expect(state.status).toBe("awaiting-strip"); // 0 fast < 2 needed
	});

	it("passes a Mirrored check by deliberately mixing in wrong answers", () => {
		let state = started(["mirrored"]); // needs 2 wrong + 3 correct
		state = answerWith(state, true);
		state = answerWith(state, true);
		state = answerWith(state, true);
		state = answerWith(state, false);
		state = answerWith(state, false);
		expect(state.gatesCleared).toBe(1);
	});

	it("fails a Mirrored check when every answer is right", () => {
		let state = started(["mirrored"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true); // 0 wrong < 2 needed
		expect(state.status).toBe("awaiting-strip");
	});

	it("pays the stacked reward multiplier of a check-config on a pass", () => {
		let state = started(["mirrored"]); // 2× reward
		state = answerWith(state, true);
		state = answerWith(state, true);
		state = answerWith(state, true);
		state = answerWith(state, false);
		state = answerWith(state, false);
		expect(state.storage).toBe(240);
	});

	it("surfaces every stacked check in checkStatuses", () => {
		const state = started(["coverage-gain", "cold-start", "mirrored"]);
		const labels = checkStatuses(state).map((check) => check.label);
		expect(labels).toEqual(["Correct", "Coverage", "Cold start", "Mirrored"]);
	});
});

describe("rewards", () => {
	it("offers three configs after a cleared gate", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.draftOptions).toHaveLength(3);
	});

	it("drafts a config and resumes answering", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		const pick = state.draftOptions.find((tag) => tag.id !== "js")!;
		state = sessionReducer(state, { type: "draft", tagId: pick.id });
		expect(state.status).toBe("answering");
		expect(tagIds(state)).toContain(pick.id);
	});

	it("adds a slot to the board", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = sessionReducer(state, { type: "add-slot" });
		expect(state.pipeline.slots).toBe(4);
		expect(state.status).toBe("answering");
	});

	it("upgrades a Focus config already equipped, no draft needed", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = sessionReducer(state, { type: "upgrade", tagId: "js" });
		expect(state.pipeline.tags[0].level).toBe(2);
		expect(state.status).toBe("answering");
	});

	it("lets the player skip the reward", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = sessionReducer(state, { type: "skip-reward" });
		expect(state.status).toBe("answering");
		expect(tagIds(state)).toHaveLength(1);
	});

	it("rebuilds the draft for a rising Fibonacci cost (1, 2, 3, … KB)", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true); // 120KB
		const before = state.storage;
		const firstOffer = state.draftOptions.map((tag) => tag.id);
		state = sessionReducer(state, { type: "reroll-draft" }); // 1KB
		expect(before - state.storage).toBe(1);
		expect(state.draftOptions.map((tag) => tag.id)).not.toEqual(firstOffer);
		state = sessionReducer(state, { type: "reroll-draft" }); // +2KB
		state = sessionReducer(state, { type: "reroll-draft" }); // +3KB
		expect(state.rerollsUsed).toBe(3);
		expect(before - state.storage).toBe(6); // 1 + 2 + 3
	});

	it("can't rebuild when storage is short", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = { ...state, storage: 0 };
		const stalled = sessionReducer(state, { type: "reroll-draft" }); // 1KB > 0
		expect(stalled.rerollsUsed).toBe(0);
		expect(stalled.storage).toBe(0);
	});
});

describe("the failure model — drop N configs, N climbs", () => {
	it("demands a single strip early in the climb", () => {
		let state = started(["push-force"]); // push-force lifts the bar to 2 correct
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false); // 0 correct < 2 → miss
		expect(state.status).toBe("awaiting-strip");
		expect(state.stripsRemaining).toBe(1);
	});

	it("resumes answering after the drop quota is peeled", () => {
		let state = started(["push-force", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		state = sessionReducer(state, { type: "strip", tagId: "push-force" });
		expect(state.status).toBe("answering");
		expect(tagIds(state)).toEqual(["js"]);
	});

	it("escalates the drop count deeper in the climb", () => {
		expect(dropCount(0)).toBe(1); // gate 1
		expect(dropCount(2)).toBe(2); // gate 3
		expect(dropCount(4)).toBe(3); // gate 5
	});

	it("ends the run when a bare build misses a gate", () => {
		let state = started([]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("dead");
	});
});

describe("the summit", () => {
	it("wins by clearing VICTORY_GATE gates", () => {
		let state = started(["js"]);
		for (let gate = 0; gate < VICTORY_GATE; gate++) state = clearGate(state);
		expect(state.status).toBe("won");
		expect(state.gatesCleared).toBe(VICTORY_GATE);
	});
});

describe("Focus commitments", () => {
	it("fails the gate when a Focus category appears but isn't nailed", () => {
		const polls: SlicePoll[] = [
			poll("f0", false, "js"),
			poll("f1", true, "react"),
			poll("f2", true, "react"),
			poll("f3", true, "react"),
			poll("f4", true, "react"),
		];
		let state = createSession(polls, handed);
		state = sessionReducer(state, { type: "slot", tagId: "js" });
		state = sessionReducer(state, { type: "start" });
		state = answerWith(state, false); // js poll, wrong
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		expect(state.status).toBe("awaiting-strip");
	});

	it("ignores the commitment when the Focus category never appears", () => {
		let state = started(["ts"]); // ts focus, but the pool is all react
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.gatesCleared).toBe(1);
	});
});

describe("disabledOptionIds — linter crosses out a wrong answer", () => {
	it("disables one wrong option on a JS poll when ESLint is equipped", () => {
		expect(disabledOptionIds([SLICE_TAGS.eslint], triPoll("js")).size).toBe(1);
	});

	it("disables nothing on a CSS poll for ESLint (wrong category)", () => {
		expect(disabledOptionIds([SLICE_TAGS.eslint], triPoll("css")).size).toBe(0);
	});

	it("never disables a correct option", () => {
		expect(disabledOptionIds([SLICE_TAGS.eslint], triPoll("js")).has("a")).toBe(
			false
		);
	});

	it("keeps at least one wrong option enabled so it stays a real choice", () => {
		expect(
			disabledOptionIds([SLICE_TAGS.eslint], poll("x", true, "js")).size
		).toBe(0);
	});
});

describe("hasLinter — gates the on-demand lint button", () => {
	it("is true when a linter config is equipped", () => {
		expect(hasLinter([SLICE_TAGS.eslint])).toBe(true);
	});

	it("is false with no linter config", () => {
		expect(hasLinter([SLICE_TAGS.js, SLICE_TAGS.copilot])).toBe(false);
	});
});

describe("IndexedDB — storage faucet", () => {
	it("earns storage per correct answer only", () => {
		let state = started(["indexed-db"]);
		state = answerWith(state, true);
		expect(state.storage).toBe(8);
		state = answerWith(state, false);
		expect(state.storage).toBe(8);
	});
});

describe("Run linter — paid on-demand, needs a linter config", () => {
	it("spends storage to cross out a wrong option when a linter is equipped", () => {
		const base: SessionState = {
			...createSession([triPoll("react")], handed),
			status: "answering",
			storage: 100,
			pipeline: { id: "pipeline", slots: 3, tags: [SLICE_TAGS.eslint] },
		};
		const linted = sessionReducer(base, { type: "lint-poll" });
		expect(linted.storage).toBe(60);
		expect(linted.manualDisabled).toHaveLength(1);
	});

	it("does nothing without a linter config equipped", () => {
		const base: SessionState = {
			...createSession([triPoll("react")], handed),
			status: "answering",
			storage: 100,
			pipeline: { id: "pipeline", slots: 3, tags: [SLICE_TAGS.js] },
		};
		const linted = sessionReducer(base, { type: "lint-poll" });
		expect(linted.storage).toBe(100);
		expect(linted.manualDisabled).toHaveLength(0);
	});
});

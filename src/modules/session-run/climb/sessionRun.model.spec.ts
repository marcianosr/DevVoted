import { describe, expect, it } from "vitest";

import type { CategoryCode } from "~/domains/shared/categories";

import { CONFIGS } from "../configs/configRoster.model";
import { SLICE_WINDOW, STORAGE_CAP_KB, VICTORY_GATE } from "../rules.model";
import {
	createSession,
	sessionReducer,
	SessionPoll,
	SessionState,
} from "./sessionRun.model";

const poll = (
	id: string,
	correct: boolean,
	category: CategoryCode = "react"
): SessionPoll => ({
	id,
	category,
	question: `Does ${id} beat Banjo?`,
	answerType: "single",
	options: [
		{ id: `${id}-a`, label: "Yes", correct },
		{ id: `${id}-b`, label: "No", correct: !correct },
	],
});

const pool = (size: number): SessionPoll[] =>
	Array.from({ length: size }, (_, index) => poll(`kazooie-${index}`, true));

const handed = [
	CONFIGS.js,
	CONFIGS.eslint,
	CONFIGS.coverageGain,
	CONFIGS.coldStart,
	CONFIGS.indexedDb,
];

const configIds = (state: SessionState): string[] =>
	state.pipeline.configs.map((config) => config.id);

const answerWith = (state: SessionState, correct: boolean): SessionState => {
	const current = state.polls[state.currentIndex];
	const option = current.options.find(
		(candidate) => candidate.correct === correct
	);
	if (!option) throw new Error("no matching option");
	return sessionReducer(state, {
		type: "answer",
		optionIds: [option.id],
	});
};

const started = (slotIds: string[], size = 60): SessionState => {
	let state = createSession(pool(size), handed);
	for (const configId of slotIds)
		state = sessionReducer(state, { type: "slot", configId });
	return sessionReducer(state, { type: "start" });
};

describe("configuring", () => {
	it("refuses to slot beyond the pipeline's slots", () => {
		let state = createSession(pool(60), handed);
		for (const id of ["js", "eslint", "coverage-gain", "cold-start"])
			state = sessionReducer(state, { type: "slot", configId: id });
		expect(state.pipeline.configs).toHaveLength(3);
	});
});

describe("gates and rewards", () => {
	it("clears a gate into the reward screen and grants storage", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.gatesCleared).toBe(1);
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(120);
	});

	it("pays a check-config's stacked multiplier on a pass", () => {
		let state = started(["coverage-gain"]); // 1.5× reward, needs +4% coverage
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true); // 5 correct → +5% coverage
		expect(state.storage).toBe(180);
	});

	it("takes several rewards (upgrade + slot + draft) and stays until finish", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");

		// Fund the shop: JS coverage for the focus upgrade, storage for the draft.
		state = { ...state, coverageByCategory: { js: 100 }, storage: 500 };
		state = sessionReducer(state, { type: "upgrade", configId: "js" });
		expect(state.pipeline.configs[0].level).toBe(2);
		expect(state.status).toBe("rewarding");

		state = sessionReducer(state, { type: "add-slot" });
		expect(state.pipeline.slots).toBe(4);
		expect(state.status).toBe("rewarding");

		const pick = state.draftOptions.find((config) => config.id !== "js")!;
		state = sessionReducer(state, { type: "draft", configId: pick.id });
		expect(state.pipeline.configs.map((config) => config.id)).toContain(
			pick.id
		);
		expect(state.status).toBe("rewarding");

		state = sessionReducer(state, { type: "finish-reward" });
		expect(state.status).toBe("answering");
	});

	it("gates a Focus upgrade on category coverage (not KB)", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true); // react polls → no JS coverage
		expect(state.status).toBe("rewarding");

		state = sessionReducer(state, { type: "upgrade", configId: "js" }); // needs 5% JS coverage
		expect(state.pipeline.configs[0].level ?? 1).toBe(1); // blocked

		state = { ...state, coverageByCategory: { js: 100 } };
		state = sessionReducer(state, { type: "upgrade", configId: "js" });
		expect(state.pipeline.configs[0].level).toBe(2); // now allowed, no KB spent
		expect(state.storage).toBe(120);
	});

	it("charges KB to upgrade the correct config (Unit Tests)", () => {
		let state = createSession(pool(60), handed, [CONFIGS.unitTests]);
		state = sessionReducer(state, { type: "slot", configId: "js" });
		state = sessionReducer(state, { type: "start" });
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(120);

		state = sessionReducer(state, { type: "upgrade", configId: "unit-tests" }); // L1→L2 costs 60
		const unit = state.pipeline.configs.find((c) => c.id === "unit-tests")!;
		expect(unit.level).toBe(2);
		expect(state.storage).toBe(60);
	});

	it("flags newly drafted configs and clears the flag on finish", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = { ...state, storage: 500 }; // drafting costs KB

		const pick = state.draftOptions.find((config) => config.id !== "js")!;
		state = sessionReducer(state, { type: "draft", configId: pick.id });
		expect(state.draftedThisGate).toEqual([pick.id]);

		state = sessionReducer(state, { type: "finish-reward" });
		expect(state.draftedThisGate).toEqual([]);
	});
});

describe("check-configs on one pipeline", () => {
	it("fails when Coverage is unmet even though Correct passes", () => {
		let state = started(["coverage-gain"]);
		for (let i = 0; i < 3; i++) state = answerWith(state, true); // +3% < 4%
		for (let i = 0; i < 2; i++) state = answerWith(state, false);
		expect(state.status).toBe("awaiting-strip");
	});

	it("passes a Cold Start check when the first answers are correct", () => {
		let state = started(["cold-start"]); // needs first 2 correct
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.gatesCleared).toBe(1);
	});
});

describe("failure model", () => {
	it("demands a strip when a stocked pipeline misses", () => {
		let state = started(["js"]); // misses the Correct requirement
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("awaiting-strip");
		expect(state.stripsRemaining).toBe(1);
	});

	it("holds after the drop quota is peeled until the player climbs on", () => {
		let state = started(["eslint", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		state = sessionReducer(state, { type: "strip", configId: "eslint" });
		expect(state.status).toBe("awaiting-strip");
		expect(state.stripsRemaining).toBe(0);
		state = sessionReducer(state, { type: "resume-climb" });
		expect(state.status).toBe("answering");
		expect(configIds(state)).toEqual(["js"]);
	});

	it("ignores a strip once the quota is met", () => {
		let state = started(["eslint", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		state = sessionReducer(state, { type: "strip", configId: "eslint" });
		const afterQuota = sessionReducer(state, {
			type: "strip",
			configId: "js",
		});
		expect(afterQuota).toBe(state);
	});

	it("ends the run when a bare pipeline misses", () => {
		let state = started([]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("dead");
	});
});

describe("the summit", () => {
	it("wins by clearing VICTORY_GATE gates", () => {
		let state = started(["js"]);
		for (let gate = 0; gate < VICTORY_GATE; gate++) {
			for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
			if (state.status === "rewarding")
				state = sessionReducer(state, { type: "finish-reward" });
		}
		expect(state.status).toBe("won");
		expect(state.gatesCleared).toBe(VICTORY_GATE);
	});
});

describe("fixed configs", () => {
	it("pre-slots a fixed config that can't be unslotted", () => {
		let state = createSession(pool(60), handed, [CONFIGS.unitTests]);
		expect(configIds(state)).toEqual(["unit-tests"]);
		state = sessionReducer(state, { type: "unslot", configId: "unit-tests" });
		expect(configIds(state)).toEqual(["unit-tests"]);
	});

	it("counts only non-fixed configs against the slots", () => {
		let state = createSession(pool(60), handed, [CONFIGS.unitTests]);
		for (const id of ["js", "eslint", "coverage-gain", "cold-start"])
			state = sessionReducer(state, { type: "slot", configId: id });
		expect(state.pipeline.configs).toHaveLength(4); // 3 free + the fixed one
	});

	it("dies only once nothing but the fixed config remains", () => {
		let state = createSession(pool(60), handed, [CONFIGS.unitTests]);
		state = sessionReducer(state, { type: "slot", configId: "js" });
		state = sessionReducer(state, { type: "start" });
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("awaiting-strip"); // js still peelable
		state = sessionReducer(state, { type: "strip", configId: "js" });
		state = sessionReducer(state, { type: "resume-climb" });
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("dead"); // only the fixed config left → bare
	});
});

describe("streak", () => {
	it("counts consecutive correct answers and resets on a wrong one", () => {
		let state = started(["js"]);
		state = answerWith(state, true);
		state = answerWith(state, true);
		expect(state.streak).toBe(2);
		state = answerWith(state, false);
		expect(state.streak).toBe(0);
	});

	it("survives a gate clear — it tracks the run, not the window", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.gatesCleared).toBe(1);
		expect(state.window.answered).toBe(0); // window reset on clear
		expect(state.streak).toBe(SLICE_WINDOW); // streak carried over
	});
});

describe("economy", () => {
	it("earns storage from the IndexedDB faucet on correct answers only", () => {
		let state = started(["indexed-db"]);
		state = answerWith(state, true);
		expect(state.storage).toBe(8);
		state = answerWith(state, false);
		expect(state.storage).toBe(8);
	});

	it("caps storage at 1 MB, discarding gate reward beyond the limit", () => {
		let state = { ...started(["js"]), storage: STORAGE_CAP_KB - 10 };
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.gatesCleared).toBe(1);
		expect(state.storage).toBe(STORAGE_CAP_KB);
	});

	it("caps storage at 1 MB, discarding faucet income beyond the limit", () => {
		let state = { ...started(["indexed-db"]), storage: STORAGE_CAP_KB - 3 };
		state = answerWith(state, true); // faucet pays 8KB, only 3 fit
		expect(state.storage).toBe(STORAGE_CAP_KB);
	});

	it("gates the lint action behind a linter config", () => {
		// JS poll: ESLint covers JS/TS, so the lint action is unlocked; two wrong options remain for the manual lint.
		const triPoll: SessionPoll = {
			id: "tri",
			category: "js",
			question: "Pick",
			answerType: "single",
			options: [
				{ id: "a", label: "A", correct: true },
				{ id: "b", label: "B", correct: false },
				{ id: "c", label: "C", correct: false },
				{ id: "d", label: "D", correct: false },
			],
		};
		const withLinter: SessionState = {
			...createSession([triPoll], handed),
			status: "answering",
			storage: 100,
			pipeline: { id: "pipeline", slots: 3, configs: [CONFIGS.eslint] },
		};
		const linted = sessionReducer(withLinter, { type: "lint-poll" });
		expect(linted.storage).toBe(60);
		expect(linted.manualDisabled).toHaveLength(1);

		const noLinter: SessionState = {
			...createSession([triPoll], handed),
			status: "answering",
			storage: 100,
			pipeline: { id: "pipeline", slots: 3, configs: [CONFIGS.js] },
		};
		const unchanged = sessionReducer(noLinter, { type: "lint-poll" });
		expect(unchanged.storage).toBe(100);
	});
});

describe("answer judging", () => {
	const multiPoll = (): SessionPoll => ({
		id: "m",
		category: "ts",
		question: "Which are TS utility types?",
		answerType: "multiple",
		options: [
			{ id: "a", label: "Partial", correct: true },
			{ id: "b", label: "Pick", correct: true },
			{ id: "c", label: "Banjo", correct: false },
		],
	});
	const answering = (): SessionState => ({
		...createSession([multiPoll(), ...pool(5)], handed),
		status: "answering",
	});

	it("marks multiple-choice correct only for the exact correct set", () => {
		expect(
			sessionReducer(answering(), { type: "answer", optionIds: ["a", "b"] })
				.window.correct
		).toBe(1);
	});

	it("marks a subset of the correct set wrong", () => {
		expect(
			sessionReducer(answering(), { type: "answer", optionIds: ["a"] }).window
				.correct
		).toBe(0);
	});

	it("marks the correct set plus a wrong option wrong", () => {
		expect(
			sessionReducer(answering(), {
				type: "answer",
				optionIds: ["a", "b", "c"],
			}).window.correct
		).toBe(0);
	});

	it("ignores an empty answer", () => {
		const before = answering();
		expect(sessionReducer(before, { type: "answer", optionIds: [] })).toBe(
			before
		);
	});
});

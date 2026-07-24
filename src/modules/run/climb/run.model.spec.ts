import { describe, expect, it } from "vitest";

import type { CategoryCode } from "~/domains/shared/categories";

import { CONFIGS } from "../configs/configRoster.model";
import { MAX_SLOTS } from "../pipeline/pipeline.model";
import { SLICE_WINDOW, STORAGE_CAP_KB, VICTORY_GATE } from "../rules.model";
import { createRun, runReducer, RunPoll, RunState } from "./run.model";

const poll = (
	id: string,
	correct: boolean,
	category: CategoryCode = "react"
): RunPoll => ({
	id,
	category,
	question: `Does ${id} beat Banjo?`,
	answerType: "single",
	options: [
		{ id: `${id}-a`, label: "Yes", correct },
		{ id: `${id}-b`, label: "No", correct: !correct },
	],
});

const pool = (size: number): RunPoll[] =>
	Array.from({ length: size }, (_, index) => poll(`kazooie-${index}`, true));

const handed = [
	CONFIGS.js,
	CONFIGS.eslint,
	CONFIGS.coverageGain,
	CONFIGS.coldStart,
	CONFIGS.indexedDb,
];

const configIds = (state: RunState): string[] =>
	state.pipeline.configs.map((config) => config.id);

const answerWith = (state: RunState, correct: boolean): RunState => {
	const current = state.polls[state.currentIndex];
	const option = current.options.find(
		(candidate) => candidate.correct === correct
	);
	if (!option) throw new Error("no matching option");
	return runReducer(state, {
		type: "answer",
		optionIds: [option.id],
	});
};

const started = (slotIds: string[], size = 60): RunState => {
	let state = createRun(pool(size), handed);
	for (const configId of slotIds)
		state = runReducer(state, { type: "slot", configId });
	return runReducer(state, { type: "start" });
};

describe("configuring", () => {
	it("refuses to slot beyond the pipeline's slots", () => {
		let state = createRun(pool(60), handed);
		for (const id of ["js", "eslint", "coverage-gain", "cold-start"])
			state = runReducer(state, { type: "slot", configId: id });
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

		// Fund the shop: JS coverage for the focus upgrade, storage for the draft,
		// and total coverage past the 20% gate for the first extra slot.
		state = {
			...state,
			coverageByCategory: { js: 100 },
			coverage: 100,
			storage: 500,
		};
		state = runReducer(state, { type: "upgrade", configId: "js" });
		expect(state.pipeline.configs[0].level).toBe(2);
		expect(state.status).toBe("rewarding");

		state = runReducer(state, { type: "add-slot" });
		expect(state.pipeline.slots).toBe(4);
		expect(state.status).toBe("rewarding");

		const pick = state.draftOptions.find((config) => config.id !== "js")!;
		state = runReducer(state, { type: "draft", configId: pick.id });
		expect(state.pipeline.configs.map((config) => config.id)).toContain(
			pick.id
		);
		expect(state.status).toBe("rewarding");

		state = runReducer(state, { type: "finish-reward" });
		expect(state.status).toBe("answering");
	});

	it("gates a Focus upgrade on category coverage (not KB)", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true); // react polls → no JS coverage
		expect(state.status).toBe("rewarding");

		state = runReducer(state, { type: "upgrade", configId: "js" }); // needs 5% JS coverage
		expect(state.pipeline.configs[0].level ?? 1).toBe(1); // blocked

		state = { ...state, coverageByCategory: { js: 100 } };
		state = runReducer(state, { type: "upgrade", configId: "js" });
		expect(state.pipeline.configs[0].level).toBe(2); // now allowed, no KB spent
		expect(state.storage).toBe(120);
	});

	it("charges KB to upgrade the correct config (Unit Tests)", () => {
		let state = createRun(pool(60), handed, [CONFIGS.unitTests]);
		state = runReducer(state, { type: "slot", configId: "js" });
		state = runReducer(state, { type: "start" });
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(120);

		state = runReducer(state, { type: "upgrade", configId: "unit-tests" }); // L1→L2 costs 60
		const unit = state.pipeline.configs.find((c) => c.id === "unit-tests")!;
		expect(unit.level).toBe(2);
		expect(state.storage).toBe(60);
	});

	it("flags newly drafted configs and clears the flag on finish", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = { ...state, storage: 500 }; // drafting costs KB

		const pick = state.draftOptions.find((config) => config.id !== "js")!;
		state = runReducer(state, { type: "draft", configId: pick.id });
		expect(state.draftedThisGate).toEqual([pick.id]);

		state = runReducer(state, { type: "finish-reward" });
		expect(state.draftedThisGate).toEqual([]);
	});
});

describe("selling in the shop", () => {
	const rewardingWith = (configId: string): RunState => {
		let state = started([configId]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		return state;
	};

	it("removes a sold config and refunds half its draft cost", () => {
		let state = { ...rewardingWith("eslint"), storage: 0 };
		state = runReducer(state, { type: "sell", configId: "eslint" });
		expect(configIds(state)).not.toContain("eslint");
		expect(state.storage).toBe(10); // common draft cost 20 → half
	});

	it("refuses to sell a fixed config", () => {
		let state = createRun(pool(60), handed, [CONFIGS.unitTests]);
		for (const id of ["eslint"])
			state = runReducer(state, { type: "slot", configId: id });
		state = runReducer(state, { type: "start" });
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = runReducer(state, { type: "sell", configId: "unit-tests" });
		expect(configIds(state)).toContain("unit-tests");
	});
});

describe("slot coverage gate", () => {
	const rewarding = (): RunState => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		return state;
	};

	it("refuses to add a slot below the coverage threshold", () => {
		let state = { ...rewarding(), coverage: 10 }; // under the 20% gate for slot 4
		state = runReducer(state, { type: "add-slot" });
		expect(state.pipeline.slots).toBe(3);
	});

	it("adds a slot once total coverage meets the threshold", () => {
		let state = { ...rewarding(), coverage: 20 };
		state = runReducer(state, { type: "add-slot" });
		expect(state.pipeline.slots).toBe(4);
	});

	it("holds the hard cap even with abundant coverage", () => {
		let state = rewarding();
		state = {
			...state,
			coverage: 1000,
			pipeline: { ...state.pipeline, slots: MAX_SLOTS },
		};
		state = runReducer(state, { type: "add-slot" });
		expect(state.pipeline.slots).toBe(MAX_SLOTS);
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
		state = runReducer(state, { type: "strip", configId: "eslint" });
		expect(state.status).toBe("awaiting-strip");
		expect(state.stripsRemaining).toBe(0);
		state = runReducer(state, { type: "resume-climb" });
		expect(state.status).toBe("answering");
		expect(configIds(state)).toEqual(["js"]);
	});

	it("ignores a strip once the quota is met", () => {
		let state = started(["eslint", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		state = runReducer(state, { type: "strip", configId: "eslint" });
		const afterQuota = runReducer(state, {
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
				state = runReducer(state, { type: "finish-reward" });
		}
		expect(state.status).toBe("won");
		expect(state.gatesCleared).toBe(VICTORY_GATE);
	});
});

describe("fixed configs", () => {
	it("pre-slots a fixed config that can't be unslotted", () => {
		let state = createRun(pool(60), handed, [CONFIGS.unitTests]);
		expect(configIds(state)).toEqual(["unit-tests"]);
		state = runReducer(state, { type: "unslot", configId: "unit-tests" });
		expect(configIds(state)).toEqual(["unit-tests"]);
	});

	it("counts only non-fixed configs against the slots", () => {
		let state = createRun(pool(60), handed, [CONFIGS.unitTests]);
		for (const id of ["js", "eslint", "coverage-gain", "cold-start"])
			state = runReducer(state, { type: "slot", configId: id });
		expect(state.pipeline.configs).toHaveLength(4); // 3 free + the fixed one
	});

	it("dies only once nothing but the fixed config remains", () => {
		let state = createRun(pool(60), handed, [CONFIGS.unitTests]);
		state = runReducer(state, { type: "slot", configId: "js" });
		state = runReducer(state, { type: "start" });
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, false);
		expect(state.status).toBe("awaiting-strip"); // js still peelable
		state = runReducer(state, { type: "strip", configId: "js" });
		state = runReducer(state, { type: "resume-climb" });
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

	it("scales each correct answer's coverage by the streak, applied last", () => {
		let state = started([]); // bare pipeline → base earn of 1 per correct
		state = answerWith(state, true);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(1.1); // streak 1
		state = answerWith(state, true);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(1.2); // streak 2
		expect(state.coverage).toBe(2.3); // 1.1 + 1.2
	});

	it("holds the streak (and its bonus) on a partial multi-answer pick", () => {
		const multi: RunPoll = {
			id: "multi",
			category: "react",
			question: "Pick the correct ones",
			answerType: "multiple",
			options: [
				{ id: "m-a", label: "A", correct: true },
				{ id: "m-b", label: "B", correct: true },
				{ id: "m-c", label: "C", correct: false },
			],
		};
		let state = createRun([poll("a", true), poll("b", true), multi], handed);
		state = runReducer(state, { type: "start" });
		state = answerWith(state, true); // streak 1
		state = answerWith(state, true); // streak 2
		state = runReducer(state, { type: "answer", optionIds: ["m-a"] }); // partial
		expect(state.answeredThisGate.at(-1)?.outcome).toBe("partial");
		expect(state.streak).toBe(2); // held: not reset, not incremented
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(0.9); // 0.5 share × 1.5 difficulty (3-opt multiple) × 1.2 streak
	});

	it("earns no coverage and zeroes the streak on a wrong answer", () => {
		let state = started([]);
		state = answerWith(state, true); // streak 1
		state = answerWith(state, false);
		expect(state.streak).toBe(0);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(0);
	});
});

describe("gate base multiplier", () => {
	// base is the correctness score before streak/config amplify it — it isolates
	// the gate factor from the streak bonus every correct answer also carries.
	const baseAt = (gatesCleared: number, correct: boolean): number | undefined =>
		answerWith(
			{ ...started([]), gatesCleared, streak: 0 },
			correct
		).answeredThisGate.at(-1)?.coverageBreakdown?.base;

	it("scales the correctness base by the gate number (gate 1 ×1, gate 2 ×2, …)", () => {
		expect(baseAt(0, true)).toBe(1); // gate 1
		expect(baseAt(1, true)).toBe(2); // gate 2
		expect(baseAt(2, true)).toBe(3); // gate 3
	});

	it("scales a wrong answer's loss by the gate too — risk cuts deeper as you climb", () => {
		expect(baseAt(0, false)).toBe(-0.5); // gate 1: -0.5 × 1
		expect(baseAt(1, false)).toBe(-1); // gate 2: -0.5 × 2
		expect(baseAt(4, false)).toBe(-2.5); // gate 5: -0.5 × 5
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
		const triPoll: RunPoll = {
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
		const withLinter: RunState = {
			...createRun([triPoll], handed),
			status: "answering",
			storage: 100,
			pipeline: { id: "pipeline", slots: 3, configs: [CONFIGS.eslint] },
		};
		const linted = runReducer(withLinter, { type: "lint-poll" });
		expect(linted.storage).toBe(60);
		expect(linted.manualDisabled).toHaveLength(1);

		const noLinter: RunState = {
			...createRun([triPoll], handed),
			status: "answering",
			storage: 100,
			pipeline: { id: "pipeline", slots: 3, configs: [CONFIGS.js] },
		};
		const unchanged = runReducer(noLinter, { type: "lint-poll" });
		expect(unchanged.storage).toBe(100);
	});
});

describe("answer judging", () => {
	const multiPoll = (): RunPoll => ({
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
	const answering = (): RunState => ({
		...createRun([multiPoll(), ...pool(5)], handed),
		status: "answering",
	});

	it("marks multiple-choice correct only for the exact correct set", () => {
		expect(
			runReducer(answering(), { type: "answer", optionIds: ["a", "b"] }).window
				.correct
		).toBe(1);
	});

	it("marks a subset of the correct set wrong", () => {
		expect(
			runReducer(answering(), { type: "answer", optionIds: ["a"] }).window
				.correct
		).toBe(0);
	});

	it("marks the correct set plus a wrong option wrong", () => {
		expect(
			runReducer(answering(), {
				type: "answer",
				optionIds: ["a", "b", "c"],
			}).window.correct
		).toBe(0);
	});

	const outcomeOf = (optionIds: string[]) =>
		runReducer(answering(), { type: "answer", optionIds }).answeredThisGate[0]
			.outcome;

	it("records the exact correct set as a correct outcome", () => {
		expect(outcomeOf(["a", "b"])).toBe("correct");
	});

	it("records a subset of the correct set as partial", () => {
		expect(outcomeOf(["a"])).toBe("partial");
	});

	it("records the correct set plus a wrong option as partial", () => {
		expect(outcomeOf(["a", "b", "c"])).toBe("partial");
	});

	it("records only-wrong picks as a wrong outcome, never partial", () => {
		expect(outcomeOf(["c"])).toBe("wrong");
	});

	it("earns half the coverage for demonstrating half the correct set", () => {
		const partial = runReducer(answering(), {
			type: "answer",
			optionIds: ["a"],
		});
		// 0.5 share × 1.5 difficulty (3-opt multiple) × 1.0 streak = 0.75, rounded to 0.8.
		expect(partial.coverage).toBe(0.8);
		expect(partial.answeredThisGate[0].coverageEarned).toBe(0.8);
	});

	it("pays more coverage for a multiple-choice poll than a single answered fully correct", () => {
		const singlePoll: RunPoll = {
			id: "s",
			category: "ts",
			question: "Which is a TS utility type?",
			answerType: "single",
			options: [
				{ id: "s-a", label: "Partial", correct: true },
				{ id: "s-b", label: "Banjo", correct: false },
				{ id: "s-c", label: "Kazooie", correct: false },
			],
		};
		const single = runReducer(
			{ ...createRun([singlePoll, ...pool(5)], handed), status: "answering" },
			{ type: "answer", optionIds: ["s-a"] }
		);
		const multiple = runReducer(answering(), {
			type: "answer",
			optionIds: ["a", "b"],
		});
		expect(multiple.answeredThisGate[0].coverageEarned ?? 0).toBeGreaterThan(
			single.answeredThisGate[0].coverageEarned ?? 0
		);
	});

	it("cancels a correct pick with a wrong one — nothing earned, loss applied", () => {
		// 1 right + 1 wrong of a 2-correct set → share 0 → the miss penalty bites.
		const cancelled = runReducer(answering(), {
			type: "answer",
			optionIds: ["a", "c"],
		});
		expect(cancelled.coverage).toBe(0);
		expect(cancelled.answeredThisGate[0].coverageEarned).toBe(0);
	});

	// Real pool data holds mismatched polls (DVTD-wrem audit, 2026-07-19):
	// the engine's contract for those shapes is pinned here.
	const shapedPoll = (
		answerType: RunPoll["answerType"],
		correctIds: readonly string[]
	): RunPoll => ({
		id: "shaped",
		category: "ts",
		question: "Which Kanto badge does Blaine hand out?",
		answerType,
		options: ["a", "b", "c"].map((id) => ({
			id,
			label: id,
			correct: correctIds.includes(id),
		})),
	});
	const answerShaped = (
		answerType: RunPoll["answerType"],
		correctIds: readonly string[],
		optionIds: string[]
	) =>
		runReducer(
			{
				...createRun([shapedPoll(answerType, correctIds), ...pool(5)], handed),
				status: "answering",
			},
			{ type: "answer", optionIds }
		);

	it("accepts any one of several correct options on a single-answer poll", () => {
		expect(answerShaped("single", ["a", "b"], ["b"]).window.correct).toBe(1);
	});

	it("demands the exact single option on a one-correct multiple poll — over-picking is partial", () => {
		expect(answerShaped("multiple", ["a"], ["a"]).window.correct).toBe(1);
		const overPicked = answerShaped("multiple", ["a"], ["a", "b"]);
		expect(overPicked.window.correct).toBe(0);
		expect(overPicked.answeredThisGate[0].outcome).toBe("partial");
	});

	it("can never be answered correctly when a poll has zero correct options", () => {
		// Unanswerable data must be filtered at supply — the engine stays strict.
		expect(answerShaped("single", [], ["a"]).window.correct).toBe(0);
		expect(answerShaped("single", [], ["a"]).answeredThisGate[0].outcome).toBe(
			"wrong"
		);
	});

	it("records a missed single-answer poll as wrong, never partial", () => {
		const singleMiss = runReducer(started(["js"]), {
			type: "answer",
			optionIds: ["kazooie-0-b"],
		});
		expect(singleMiss.answeredThisGate[0].outcome).toBe("wrong");
	});

	it("ignores an empty answer", () => {
		const before = answering();
		expect(runReducer(before, { type: "answer", optionIds: [] })).toBe(before);
	});
});

describe("coverage scoring", () => {
	it("bleeds coverage on a wrong answer, scaled by the reward multiplier", () => {
		const afterOneCorrect = answerWith(started(["js"]), true);
		expect(afterOneCorrect.coverage).toBe(1.1); // base 1 × streak-1 factor 1.1
		// Base pipeline multiplier is 1 → loss is the raw WRONG_COVERAGE_LOSS.
		expect(answerWith(afterOneCorrect, false).coverage).toBe(0.6); // 1.1 − 0.5
	});

	it("never drags coverage below zero", () => {
		const wrongOnEmpty = answerWith(started(["js"]), false);
		expect(wrongOnEmpty.coverage).toBe(0);
		expect(wrongOnEmpty.coverageByCategory.react ?? 0).toBe(0);
	});

	it("costs nothing to be wrong in a category with no coverage yet", () => {
		// Marciano's bug report (2026-07-19): wrong CSS answer at CSS 0% must
		// not drain the total earned elsewhere — total stays Σ(categories).
		const jsRich: RunState = {
			...started(["js"]),
			coverage: 1,
			coverageByCategory: { js: 1 },
		};
		const wrongInUntouched = answerWith(jsRich, false); // current poll is react, at 0%
		expect(wrongInUntouched.coverage).toBe(1);
		expect(wrongInUntouched.coverageByCategory.js).toBe(1);
		expect(wrongInUntouched.coverageByCategory.react ?? 0).toBe(0);
	});

	it("keeps the total equal to the sum of the categories after a loss", () => {
		const afterOneCorrect = answerWith(started(["js"]), true); // react 1
		const thenWrong = answerWith(afterOneCorrect, false); // react 1 → 0.5
		expect(thenWrong.coverage).toBe(
			Object.values(thenWrong.coverageByCategory).reduce(
				(sum, pct) => sum + pct,
				0
			)
		);
	});

	it("keeps the gate's coverage-gained tally gains-only", () => {
		// The coverage-gain check judges what you earned; the loss hits the
		// run's totals, not the gate window — no double punishment.
		const afterOneCorrect = answerWith(started(["js"]), true);
		const thenWrong = answerWith(afterOneCorrect, false);
		expect(thenWrong.window.coverageGained).toBe(1.1); // streak-1 earn, gains only
		expect(thenWrong.coverage).toBe(0.6); // 1.1 − 0.5 loss
	});
});

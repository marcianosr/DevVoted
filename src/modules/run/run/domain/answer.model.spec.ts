import { describe, expect, it } from "vitest";

import {
	type Config,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { auditsForGate } from "~/modules/run/gate/domain/audit.model";
import { isOverCapacity } from "~/modules/run/build/domain/build.model";
import {
	BASE_SLOTS,
	FAUCET_CAP_KB,
	GATE_COUNT,
	SLICE_WINDOW,
	VICTORY_GATE,
	coverageDemandFor,
} from "~/modules/run/run/domain/rules.model";
import {
	createRun,
	type RunState,
	scheduleOf,
} from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	answerWith,
	clearGate,
	failGate,
	handed,
	payPeel,
	poll,
	pool,
	started,
} from "~/modules/run/run/domain/run.factory";

describe("gates and rewards", () => {
	it("clears a gate into the reward screen and grants storage", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(32);
	});

	it("pays the flat Unit Tests payout on top of the gate reward", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.storage).toBe(64);
	});

	it("pays the cleared gate by its window, not the ceiling", () => {
		let state = started(["js"]);
		state = answerWith(state, false);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(state.gateRewardKb).toBe(26);
		expect(state.storage).toBe(26);
	});

	it("takes several rewards (upgrade + slot + draft) and stays until finish", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");

		state = {
			...state,
			coverageByCategory: { js: 100 },
			coverage: 100,
			storage: 500,
		};
		state = runReducer(state, { type: "upgrade", configId: "js" });
		expect(state.build.configs[0].level).toBe(2);
		expect(state.status).toBe("rewarding");

		state = { ...state, build: { ...state.build, slots: 16 } };
		expect(state.build.slots).toBe(16);
		expect(state.status).toBe("rewarding");

		const pick = state.draftOptions.find((config) => config.id !== "js")!;
		state = runReducer(state, { type: "draft", configId: pick.id });
		expect(state.build.configs.map((config) => config.id)).toContain(pick.id);
		expect(state.status).toBe("rewarding");

		state = runReducer(state, { type: "finish-reward" });
		expect(state.status).toBe("answering");
	});

	it("gates a Focus upgrade on category coverage AND its storage price", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(32);

		state = runReducer(state, { type: "upgrade", configId: "js" });
		expect(state.build.configs[0].level ?? 1).toBe(1);

		const earned = { ...state, coverageByCategory: { js: 100 } };
		expect(runReducer(earned, { type: "upgrade", configId: "js" })).toBe(
			earned
		);

		const funded = { ...earned, storage: upgradeStorageCost(1) };
		const upgraded = runReducer(funded, { type: "upgrade", configId: "js" });
		expect(upgraded.build.configs[0].level).toBe(2);
		expect(upgraded.storage).toBe(0);
	});

	it("upgrades Unit Tests for storage — the next level costs 32KB × level", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(64);

		state = runReducer(state, { type: "upgrade", configId: "unit-tests" });
		const unit = state.build.configs.find((c) => c.id === "unit-tests")!;
		expect(unit.level).toBe(2);
		expect(state.storage).toBe(0);

		const broke = runReducer(state, {
			type: "upgrade",
			configId: "unit-tests",
		});
		expect(broke).toBe(state);
	});

	it("flags newly drafted configs and clears the flag on finish", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		state = {
			...state,
			storage: 500,
			coverage: 100,
			build: { ...state.build, slots: state.build.slots + 1 },
		};

		const pick = state.draftOptions[0];
		state = runReducer(state, { type: "draft", configId: pick.id });
		expect(state.draftedThisGate).toEqual([pick.id]);

		state = runReducer(state, { type: "finish-reward" });
		expect(state.draftedThisGate).toEqual([]);
	});
});

describe("capacity is bought, never handed over (ADR-046)", () => {
	it("widens on no answer, however much coverage it earns", () => {
		let state = { ...started(["js"]), coverage: 1000 };
		state = answerWith(state, true);
		expect(state.build.slots).toBe(BASE_SLOTS);
	});

	it("stays the width it opened on however many gates it clears", () => {
		let state = started(["js"], 6 * SLICE_WINDOW);
		const widthAfterEachClear: number[] = [];
		for (let gate = 0; gate < 4; gate++) {
			state = clearGate(state);
			widthAfterEachClear.push(state.build.slots);
			state = runReducer(state, { type: "finish-reward" });
		}

		expect(widthAfterEachClear).toEqual([4, 4, 4, 4]);
	});

	it("keeps a bought slot through a clear on an empty balance", () => {
		const broke: RunState = {
			...started(["js"], 6 * SLICE_WINDOW),
			gatesCleared: 1,
			slotsBought: 1,
			storage: 0,
			build: { ...started(["js"], 6 * SLICE_WINDOW).build, slots: 5 },
		};
		const state = clearGate(broke);

		expect(state.build.slots).toBe(5);
		expect(state.storage).toBeGreaterThan(0);
		expect(isOverCapacity(state.build)).toBe(false);
	});
});

describe("the gate's window meter (ADR-035)", () => {
	it("fails a perfect window whose meter sits under the gate's own demand", () => {
		const state = clearGate({
			...started(["js"]),
			gatesCleared: 2,
			coverage: 500,
		});
		expect(state.status).toBe("awaiting-strip");
		expect(state.gatesCleared).toBe(2);
		expect(state.log.at(-1)).toContain("Gate 2 failed");
	});

	it("resets the meter for the retry, keeping its answers for the review", () => {
		let state = clearGate({ ...started(["js"]), gatesCleared: 2 });
		expect(state.answeredThisGate).toHaveLength(SLICE_WINDOW);
		state = payPeel(state);
		expect(state.window.coverageGained).toBe(0);
		expect(state.window.answered).toBe(0);
		state = runReducer(state, { type: "finish-reward" });
		expect(state.answeredThisGate).toEqual([]);
	});

	it("keeps the career coverage earned inside a failed attempt", () => {
		let state = { ...started(["js"]), gatesCleared: 2 };
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.coverage).toBeGreaterThan(0);
	});

	it("bleeds the meter on a wrong answer but floors it at 0", () => {
		let state = started(["js"]);
		state = answerWith(state, false);
		expect(state.window.coverageGained).toBe(0);
		state = answerWith(state, true);
		state = answerWith(state, false);
		expect(state.window.coverageGained).toBeCloseTo(0.6);
	});

	it("never advances a build that answers nothing — it peels until the run ends", () => {
		let state: RunState = { ...started(["js"]), gatesCleared: 1 };
		for (let attempt = 0; attempt < 10 && state.status !== "dead"; attempt++)
			state = runReducer(payPeel(failGate(state)), { type: "finish-reward" });
		expect(state.status).toBe("dead");
		expect(state.gatesCleared).toBe(1);
	});

	it("never ends a run at the Pallet gate — a miss there costs nothing (ADR-057)", () => {
		let state = started(["js"]);
		for (let attempt = 0; attempt < 10; attempt++)
			state = runReducer(payPeel(failGate(state)), { type: "finish-reward" });
		expect(state.status).not.toBe("dead");
		expect(state.gatesCleared).toBe(0);
		expect(state.build.configs).toHaveLength(4);
	});

	it("grades each attempt against its own gate's row of the demand table", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(coverageDemandFor(0)).toBe(3);
	});
});

describe("enhancement configs on one build", () => {
	it("doubles the opening answer's coverage with Cold Start", () => {
		let state = started(["cold-start"]);
		state = answerWith(state, true);
		expect(state.coverage).toBe(2.2);
		state = answerWith(state, true);
		expect(state.coverage).toBe(3.4);
	});

	it("stops the IndexedDB faucet at the per-run cap", () => {
		let state = started(["indexed-db"]);
		state = { ...state, faucetEarnedKb: FAUCET_CAP_KB - 4 };
		state = answerWith(state, true);
		expect(state.storage).toBe(4);
		expect(state.faucetEarnedKb).toBe(FAUCET_CAP_KB);
		state = answerWith(state, true);
		expect(state.storage).toBe(4);
	});
});

describe("the summit", () => {
	it("wins by clearing every gate — playing the mirror wrong on purpose", () => {
		const base = started(["js"], GATE_COUNT * SLICE_WINDOW);
		let state: RunState = {
			...base,
			build: {
				...base.build,
				slots: 6,
				configs: [
					...base.build.configs,
					CONFIGS.agentsMd,
					CONFIGS.intellisense,
					CONFIGS.codeCoverage,
				],
			},
		};
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			const mirrored = auditsForGate(gate, scheduleOf(state)).some(
				(audit) => audit.id === "mirrored"
			);
			for (let i = 0; i < SLICE_WINDOW; i++)
				state = answerWith(state, !mirrored);
			if (state.status === "rewarding")
				state = runReducer(state, { type: "finish-reward" });
		}
		expect(state.status).toBe("won");
		expect(state.clearedGate).toBe(VICTORY_GATE);
		expect(state.gatesCleared).toBe(GATE_COUNT);
	});
});

describe("Dependabot's counter", () => {
	const withBot = (): RunState => {
		const base = started(["js"], GATE_COUNT * SLICE_WINDOW);
		return {
			...base,
			build: {
				...base.build,
				slots: 16,
				configs: [...base.build.configs, CONFIGS.dependabot],
			},
		};
	};

	it("advances one per correct answer and fires on the fifth", () => {
		let state = withBot();
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		expect(state.autoUpgradeProgress).toBe(4);
		expect(state.autoUpgradedConfigId).toBeUndefined();

		state = answerWith(state, true);
		expect(state.autoUpgradeProgress).toBe(0);
		expect(state.autoUpgradedConfigId).toBeDefined();
		expect(state.autoUpgradedByConfigId).toBe(CONFIGS.dependabot.id);
		expect(state.build.configs.some((config) => (config.level ?? 1) > 1)).toBe(
			true
		);
	});

	it("starts the count over on a wrong answer, so four right then one wrong pays nothing", () => {
		let state = withBot();
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		state = answerWith(state, false);

		expect(state.autoUpgradeProgress).toBe(0);
		expect(state.autoUpgradedConfigId).toBeUndefined();
		expect(
			state.build.configs.every((config) => (config.level ?? 1) === 1)
		).toBe(true);
	});

	it("leaves the count at zero for a build with no Dependabot", () => {
		let state = started(["js"]);
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		expect(state.autoUpgradeProgress).toBe(0);
	});

	it("starts the count over when a gate fails, even on a correct final answer", () => {
		const base = withBot();
		const short: RunState = {
			...base,
			autoUpgradeProgress: 3,
			window: { ...base.window, answered: SLICE_WINDOW - 1, coverageGained: 0 },
		};

		const failed = answerWith(short, true);

		expect(failed.status).toBe("awaiting-strip");
		expect(failed.autoUpgradeProgress).toBe(0);
	});
});

describe("depth and width are independent (ADR-019)", () => {
	it("advances the gate on a clear the opening four slots paid for", () => {
		const state = clearGate(started(["js"]));

		expect(state.status).toBe("rewarding");
		expect(state.gatesCleared).toBe(1);
		expect(state.clearedGate).toBe(0);
		expect(state.storage).toBe(32);
	});

	it("names the badge the clear earned in the log", () => {
		expect(clearGate(started(["js"])).log.at(-1)).toContain(
			"Pallet Swatch earned"
		);
	});

	it("keeps climbing regardless of how much width has auto-widened", () => {
		let state = started(["js"], 3 * SLICE_WINDOW);
		for (let gate = 0; gate < 3; gate++) {
			state = clearGate(state);
			if (state.status === "rewarding")
				state = runReducer(state, { type: "finish-reward" });
		}

		expect(state.gatesCleared).toBe(3);
		expect(state.build.slots).toBeGreaterThanOrEqual(BASE_SLOTS);
	});

	it("pays a deeper gate more, so replaying shallow ones is never the ramp", () => {
		let state = clearGate(started(["js"], 2 * SLICE_WINDOW));
		const firstGate = state.gateRewardKb;
		state = runReducer(state, { type: "finish-reward" });
		state = clearGate(state);

		expect(state.gateRewardKb).toBeGreaterThan(firstGate ?? 0);
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
		expect(state.clearedGate).toBe(0);
		expect(state.window.answered).toBe(0);
		expect(state.streak).toBe(SLICE_WINDOW);
	});

	it("scales each correct answer's coverage by the streak, applied last", () => {
		let state = started([]);
		state = answerWith(state, true);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(1.1);
		state = answerWith(state, true);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(1.2);
		expect(state.coverage).toBe(2.3);
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
		let state: RunState = {
			...createRun([poll("a", true), poll("b", true), multi], handed),
			status: "answering",
		};
		state = answerWith(state, true);
		state = answerWith(state, true);
		state = runReducer(state, { type: "answer", optionIds: ["m-a"] });
		expect(state.answeredThisGate.at(-1)?.outcome).toBe("partial");
		expect(state.streak).toBe(2);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(0.9);
	});

	it("earns no coverage and zeroes the streak on a wrong answer", () => {
		let state = started([]);
		state = answerWith(state, true);
		state = answerWith(state, false);
		expect(state.streak).toBe(0);
		expect(state.answeredThisGate.at(-1)?.coverageEarned).toBe(0);
	});
});

describe("gate base multiplier", () => {
	const baseAt = (gatesCleared: number, correct: boolean): number | undefined =>
		answerWith(
			{ ...started([]), gatesCleared, streak: 0 },
			correct
		).answeredThisGate.at(-1)?.coverageBreakdown?.base;

	it("scales the correctness base by the gate number (gate 1 ×1, gate 2 ×2, …)", () => {
		expect(baseAt(0, true)).toBe(1);
		expect(baseAt(1, true)).toBe(2);
		expect(baseAt(2, true)).toBe(3);
	});

	it("scales a wrong answer's loss by the gate too — risk cuts deeper as you climb", () => {
		expect(baseAt(0, false)).toBe(-0.5);
		expect(baseAt(1, false)).toBe(-1);
		expect(baseAt(4, false)).toBe(-2.5);
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
		const cancelled = runReducer(answering(), {
			type: "answer",
			optionIds: ["a", "c"],
		});
		expect(cancelled.coverage).toBe(0);
		expect(cancelled.answeredThisGate[0].coverageEarned).toBe(0);
	});

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
	it("bleeds coverage on a wrong answer, at half of what a right one pays", () => {
		const afterOneCorrect = answerWith(started(["js"]), true);
		expect(afterOneCorrect.coverage).toBe(1.1);
		expect(answerWith(afterOneCorrect, false).coverage).toBe(0.6);
	});

	it("never drags coverage below zero", () => {
		const wrongOnEmpty = answerWith(started(["js"]), false);
		expect(wrongOnEmpty.coverage).toBe(0);
		expect(wrongOnEmpty.coverageByCategory.react ?? 0).toBe(0);
	});

	it("costs nothing to be wrong in a category with no coverage yet", () => {
		const jsRich: RunState = {
			...started(["js"]),
			coverage: 1,
			coverageByCategory: { js: 1 },
		};
		const wrongInUntouched = answerWith(jsRich, false);
		expect(wrongInUntouched.coverage).toBe(1);
		expect(wrongInUntouched.coverageByCategory.js).toBe(1);
		expect(wrongInUntouched.coverageByCategory.react ?? 0).toBe(0);
	});

	it("keeps the total equal to the sum of the categories after a loss", () => {
		const afterOneCorrect = answerWith(started(["js"]), true);
		const thenWrong = answerWith(afterOneCorrect, false);
		expect(thenWrong.coverage).toBe(
			Object.values(thenWrong.coverageByCategory).reduce(
				(sum, pct) => sum + pct,
				0
			)
		);
	});

	it("bleeds the gate meter and the career total in step (ADR-035)", () => {
		const afterOneCorrect = answerWith(started(["js"]), true);
		const thenWrong = answerWith(afterOneCorrect, false);
		expect(thenWrong.window.coverageGained).toBe(0.6);
		expect(thenWrong.coverage).toBe(0.6);
	});
});

describe("Cache", () => {
	const withCache = (state: RunState): RunState => ({
		...state,
		build: {
			...state.build,
			slots: state.build.slots + 4,
			configs: [...state.build.configs, CONFIGS.cache],
		},
	});

	const buildFactorOf = (state: RunState, index: number): number | undefined =>
		state.answeredThisGate[index]?.coverageFactors?.build;

	it("pays ×1 on a cold category and one step more per cached hit", () => {
		let state = withCache(started(["js"]));
		state = answerWith(state, true);
		state = answerWith(state, true);
		state = answerWith(state, true);
		expect(buildFactorOf(state, 0)).toBe(1);
		expect(buildFactorOf(state, 1)).toBe(1.25);
		expect(buildFactorOf(state, 2)).toBe(1.5);
	});

	it("flushes the category on a wrong answer and rebuilds from cold", () => {
		let state = withCache(started(["js"]));
		state = answerWith(state, true);
		state = answerWith(state, false);
		state = answerWith(state, true);
		state = answerWith(state, true);
		expect(buildFactorOf(state, 2)).toBe(1);
		expect(buildFactorOf(state, 3)).toBe(1.25);
	});

	it("keeps a category warm across a gate clear, capped at ×2", () => {
		let state = withCache(started(["js"]));
		state = clearGate(state);
		state = runReducer(state, { type: "finish-reward" });
		state = answerWith(state, true);
		expect(buildFactorOf(state, 0)).toBe(2);
	});
});

describe("A/B Test", () => {
	const withAbTest = (state: RunState): RunState => ({
		...state,
		build: {
			...state.build,
			slots: state.build.slots + 2,
			configs: [...state.build.configs, CONFIGS.abTest],
		},
	});

	it("ships arm A by default: coverage multiplied, no faucet", () => {
		const state = answerWith(withAbTest(started(["js"])), true);
		expect(state.answeredThisGate[0]?.coverageFactors?.build).toBe(1.25);
		expect(state.answeredThisGate[0]?.faucetKb).toBeUndefined();
	});

	it("switches to arm B in the shop: faucet paid, coverage back to ×1", () => {
		let state = clearGate(withAbTest(started(["js"])));
		state = runReducer(state, { type: "switch-arm", configId: "ab-test" });
		state = runReducer(state, { type: "finish-reward" });
		state = answerWith(state, true);
		expect(state.answeredThisGate[0]?.coverageFactors?.build).toBe(1);
		expect(state.answeredThisGate[0]?.faucetKb).toBe(8);
	});

	it("switches mid-poll, scoring the answer you are about to give", () => {
		let state = withAbTest(started(["js"]));
		state = runReducer(state, { type: "switch-arm", configId: "ab-test" });
		state = answerWith(state, true);
		expect(state.answeredThisGate[0]?.coverageFactors?.build).toBe(1);
		expect(state.answeredThisGate[0]?.faucetKb).toBe(8);
	});

	it("refuses the switch before the run has started", () => {
		const state: RunState = {
			...withAbTest(started(["js"])),
			status: "configuring",
		};
		expect(runReducer(state, { type: "switch-arm", configId: "ab-test" })).toBe(
			state
		);
	});
});

describe("Moore's Law", () => {
	const held = (state: RunState, storage: number): RunState => ({
		...state,
		storage,
	});
	const maxed = (state: RunState): RunState => ({
		...state,
		build: {
			...state.build,
			configs: state.build.configs.map((config) =>
				config.id === "moores-law" ? { ...config, level: 5 } : config
			),
		},
	});
	const answerWholeWindow = (state: RunState): RunState => {
		let next = state;
		for (let i = 0; i < SLICE_WINDOW; i++) next = answerWith(next, true);
		return next;
	};

	it("pays 2% of the balance on top of the gate reward at L1", () => {
		const state = answerWholeWindow(held(started(["moores-law"]), 128));

		expect(state.status).toBe("rewarding");
		expect(state.interestThisGateKb).toBe(2);
		expect(state.gateRewardKb).toBe(32 + 2);
		expect(state.storage).toBe(128 + 34);
	});

	it("pays five times as much once maxed, on the same balance", () => {
		const state = answerWholeWindow({
			...maxed(held(started(["moores-law"]), 512)),
			storagePlan: 2,
		});

		expect(state.interestThisGateKb).toBe(51);
	});

	it("pays interest on any balance — the floor left with the checks (ADR-035)", () => {
		const state = answerWholeWindow(held(started(["moores-law"]), 31));

		expect(state.status).toBe("rewarding");
		expect(state.interestThisGateKb).toBe(0);
	});

	it("upgrades for storage, spending the principal it then demands", () => {
		const shopping: RunState = {
			...held(started(["moores-law"]), 200),
			status: "rewarding",
		};
		const state = runReducer(shopping, {
			type: "upgrade",
			configId: "moores-law",
		});

		expect(state.storage).toBe(200 - 64);
		expect(
			state.build.configs.find((config) => config.id === "moores-law")?.level
		).toBe(2);
	});

	// The balance has to out-earn the rent as well as fit under the cap: at
	// 800 KB the 10% pays 80 against tier 2's 96 a gate, which the gate reward
	// covers. A smaller principal on the same rung decays instead.
	it("compounds while the plan is wide enough to hold the balance", () => {
		const rich: RunState = {
			...maxed(held(started(["moores-law"], 4 * SLICE_WINDOW), 800)),
			storagePlan: 2,
		};
		let state = answerWholeWindow(rich);
		const first = state.interestThisGateKb ?? 0;
		state = runReducer(state, { type: "finish-reward" });
		state = answerWholeWindow(state);

		expect(first).toBe(80);
		expect(state.interestThisGateKb).toBeGreaterThan(first);
	});
});

describe("Dependabot's merge announcement", () => {
	it("stays unset when nothing in the build carries the axis", () => {
		const state = clearGate(started(["js"]));
		expect(state.autoUpgradedConfigId).toBeUndefined();
	});

	it("clears when the climb resumes, like the slot celebration", () => {
		const announced: RunState = {
			...clearGate(started(["js"])),
			autoUpgradedConfigId: "js",
		};
		const state = runReducer(announced, { type: "finish-reward" });
		expect(state.autoUpgradedConfigId).toBeUndefined();
	});
});

describe("Deprecated's decay", () => {
	const holdingDeprecated = (multiplier: number): RunState => {
		const base = started(["js"]);
		return {
			...base,
			build: {
				...base.build,
				slots: base.build.configs.length + 1,
				configs: [
					...base.build.configs,
					{ ...CONFIGS.deprecated, coverageMultiplier: multiplier },
				],
			},
		};
	};

	const deprecatedIn = (state: RunState) =>
		state.build.configs.find((config) => config.id === "deprecated");

	it("fades ×3 to ×2.5 at the clear — the cleared gate scored at the full ×3", () => {
		const state = clearGate(holdingDeprecated(3));
		expect(deprecatedIn(state)?.coverageMultiplier).toBe(2.5);
		expect(state.deletedConfigs).toBeUndefined();
	});

	it("deletes it at ×1 and announces the deletion — the config is gone, only state can say so", () => {
		const state = clearGate(holdingDeprecated(1.5));
		expect(deprecatedIn(state)).toBeUndefined();
		expect(state.deletedConfigs).toEqual([
			{ ...CONFIGS.deprecated, coverageMultiplier: 1 },
		]);
	});

	it("does not fade on a failed gate — the redo already charges a peel", () => {
		const state = failGate(holdingDeprecated(3));
		expect(state.status).toBe("awaiting-strip");
		expect(deprecatedIn(state)?.coverageMultiplier).toBe(3);
	});

	it("clears the announcement when the climb resumes", () => {
		const announced = clearGate(holdingDeprecated(1.5));
		const state = runReducer(announced, { type: "finish-reward" });
		expect(state.deletedConfigs).toBeUndefined();
	});
});

describe("Freemium's subscription", () => {
	const unaffordablePlan: Config = { ...CONFIGS.freemium, subscriptionKb: 512 };

	const subscribed = (
		storage: number,
		plan: Config = CONFIGS.freemium
	): RunState => {
		const base = started(["js"]);
		return {
			...base,
			storage,
			build: {
				...base.build,
				slots: base.build.configs.length + 1,
				configs: [...base.build.configs, plan],
			},
		};
	};

	const freemiumIn = (state: RunState) =>
		state.build.configs.find((config) => config.id === "freemium");

	it("bills 8KB at the first clear and keeps the plan installed", () => {
		const state = clearGate(subscribed(128));
		expect(state.subscriptionBillKb).toBe(8);
		expect(freemiumIn(state)).toBeDefined();
		expect(state.lapsedConfigs).toBeUndefined();
	});

	it("bills after the gate pays, so the clear itself can cover the plan", () => {
		const state = clearGate(subscribed(0));
		expect(state.subscriptionBillKb).toBe(8);
		expect(freemiumIn(state)).toBeDefined();
	});

	it("lapses the plan when the clear cannot cover the bill, and frees the slot", () => {
		const state = clearGate(subscribed(0, unaffordablePlan));
		expect(freemiumIn(state)).toBeUndefined();
		expect(state.lapsedConfigs).toHaveLength(1);
		expect(state.subscriptionBillKb).toBe(0);
		expect(state.build.configs).toHaveLength(4);
	});

	it("does not bill a failed gate — the redo already charges a peel", () => {
		const state = failGate(subscribed(256));
		expect(state.status).toBe("awaiting-strip");
		expect(state.storage).toBe(256);
		expect(freemiumIn(state)).toBeDefined();
	});

	it("clears the bill and the lapse notice when the climb resumes", () => {
		const announced = clearGate(subscribed(0, unaffordablePlan));
		const state = runReducer(announced, { type: "finish-reward" });
		expect(state.lapsedConfigs).toBeUndefined();
		expect(state.subscriptionBillKb).toBe(0);
	});

	it("charges half price at the counter while it is installed", () => {
		const cleared = clearGate(subscribed(300));
		const shopping: RunState = {
			...cleared,
			draftOptions: [CONFIGS.agentsMd],
			build: { ...cleared.build, slots: 24 },
		};
		const drafted = runReducer(shopping, {
			type: "draft",
			configId: "agents-md",
		});
		expect(drafted.storage).toBe(shopping.storage - 128);
	});
});

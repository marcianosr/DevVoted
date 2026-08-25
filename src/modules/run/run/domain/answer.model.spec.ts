import { describe, expect, it } from "vitest";

import {
	type Config,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { auditsForGate } from "~/modules/run/gate/domain/audit.model";
import {
	BASE_SLOTS,
	MAX_SLOTS,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	coverageDemandFor,
	FAUCET_CAP_KB,
	GATE_COUNT,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
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
		expect(state.clearedGate).toBe(0); // gates count from 0
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(32); // GATE_REWARD_KB × first gate × 5/5
	});

	it("pays the flat Unit Tests payout on top of the gate reward", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.storage).toBe(64); // 32 gate + 32 Unit Tests flat
	});

	it("pays the cleared gate by its window, not the ceiling", () => {
		let state = started(["js"]); // every check skips — a 4/5 window still clears
		state = answerWith(state, false);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(state.gateRewardKb).toBe(26); // 32 × 4/5, rounded
		expect(state.storage).toBe(26);
	});

	it("takes several rewards (upgrade + slot + draft) and stays until finish", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");

		// Fund the shop: JS coverage for the focus upgrade, storage for the draft,
		// and total coverage past the slot-4 gate for the first extra slot.
		state = {
			...state,
			coverageByCategory: { js: 100 },
			coverage: 100,
			storage: 500,
		};
		state = runReducer(state, { type: "upgrade", configId: "js" });
		expect(state.pipeline.configs[0].level).toBe(2);
		expect(state.status).toBe("rewarding");

		// Width now claims itself automatically (ADR-025) rather than through a
		// shop action, so a widened pipeline is set up directly here.
		state = { ...state, pipeline: { ...state.pipeline, slots: 4 } };
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

	// A Focus upgrade answers to both gates (ADR-039): coverage says it is earned,
	// KB says it is affordable, and neither stands in for the other.
	it("gates a Focus upgrade on category coverage AND its storage price", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true); // react polls → no JS coverage
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(32); // the gate's reward, and the price is 64

		state = runReducer(state, { type: "upgrade", configId: "js" }); // needs 5% JS coverage
		expect(state.pipeline.configs[0].level ?? 1).toBe(1); // unearned

		const earned = { ...state, coverageByCategory: { js: 100 } };
		expect(runReducer(earned, { type: "upgrade", configId: "js" })).toBe(
			earned
		); // earned, still unaffordable

		const funded = { ...earned, storage: upgradeStorageCost(1) };
		const upgraded = runReducer(funded, { type: "upgrade", configId: "js" });
		expect(upgraded.pipeline.configs[0].level).toBe(2);
		expect(upgraded.storage).toBe(0); // the price was actually taken
	});

	it("upgrades Unit Tests for storage — the next level costs 32KB × level", () => {
		let state = started(["unit-tests", "js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.status).toBe("rewarding");
		expect(state.storage).toBe(64); // 32 gate + 32 Unit Tests flat

		state = runReducer(state, { type: "upgrade", configId: "unit-tests" });
		const unit = state.pipeline.configs.find((c) => c.id === "unit-tests")!;
		expect(unit.level).toBe(2);
		expect(state.storage).toBe(0); // L2 cost the full 64KB

		const broke = runReducer(state, {
			type: "upgrade",
			configId: "unit-tests",
		});
		expect(broke).toBe(state); // L3 costs 96KB — unaffordable, no-op
	});

	it("flags newly drafted configs and clears the flag on finish", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		// The pipeline starts full, so drafting needs a widened build first.
		state = {
			...state,
			storage: 500,
			coverage: 100,
			pipeline: { ...state.pipeline, slots: state.pipeline.slots + 1 },
		};

		const pick = state.draftOptions[0];
		state = runReducer(state, { type: "draft", configId: pick.id });
		expect(state.draftedThisGate).toEqual([pick.id]);

		state = runReducer(state, { type: "finish-reward" });
		expect(state.draftedThisGate).toEqual([]);
	});
});

describe("slots open on gates and coverage (ADR-041)", () => {
	it("widens on the answer that crosses a coverage threshold, mid-window", () => {
		let state = { ...started(["js"]), coverage: 1000 };
		state = answerWith(state, true);
		// Every coverage row at once: 60, 140, 240, 300 and 380.
		expect(state.pipeline.slots).toBe(BASE_SLOTS + 5);
		expect(state.justUnlockedSlots).toEqual([4, 5, 6, 7, 8]);
	});

	it("keeps a coverage-earned slot through the gate that then fails", () => {
		// The career total opens slots; the gate reads its own fresh meter and
		// fails this attempt anyway. Width earned on the way is not taken back.
		const state = clearGate({
			...started(["js"]),
			gatesCleared: 2,
			coverage: 500,
		});

		expect(state.status).toBe("awaiting-strip");
		expect(state.pipeline.slots).toBeGreaterThan(BASE_SLOTS);
	});

	it("grants no slot for the teaching gate, then one for clearing gate 1", () => {
		let state = clearGate(started(["js"], 2 * SLICE_WINDOW));
		expect(state.pipeline.slots).toBe(BASE_SLOTS);
		expect(state.justUnlockedSlots).toEqual([]);
		state = runReducer(state, { type: "finish-reward" });
		state = clearGate(state);
		expect(state.pipeline.slots).toBe(BASE_SLOTS + 1);
		expect(state.justUnlockedSlots).toEqual([BASE_SLOTS + 1]);
	});

	it("never shrinks a pipeline already wider than the grant", () => {
		const base = started(["js"], 2 * SLICE_WINDOW);
		let state = { ...base, pipeline: { ...base.pipeline, slots: MAX_SLOTS } };
		state = clearGate(state);
		state = runReducer(state, { type: "finish-reward" });
		state = clearGate(state);
		expect(state.pipeline.slots).toBe(MAX_SLOTS);
		expect(state.justUnlockedSlots).toEqual([]);
	});
});

describe("the gate's window meter (ADR-035)", () => {
	it("fails a perfect window whose meter sits under the gate's own demand", () => {
		// Gate 2 demands 25% and a from-zero perfect window at ×3 banks ~19.5%
		// — every gate is a fresh score, the run's career total never counts.
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
		// The retry's own start is what clears the failed attempt's answers.
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
		// 1 correct at streak 1.1 = 1.1, minus a bleed of half an answer (0.5).
		expect(state.window.coverageGained).toBeCloseTo(0.6);
	});

	it("never advances a build that answers nothing — it peels until the run ends", () => {
		let state = started(["js"]);
		for (let attempt = 0; attempt < 10 && state.status !== "dead"; attempt++)
			state = runReducer(payPeel(failGate(state)), { type: "finish-reward" });
		expect(state.status).toBe("dead");
		expect(state.gatesCleared).toBe(0);
	});

	it("grades each attempt against its own gate's row of the demand table", () => {
		let state = started(["js"]);
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		// A perfect teaching window banks ~6% against gate 0's 3% — cleared.
		expect(state.clearedGate).toBe(0);
		expect(coverageDemandFor(0)).toBe(3);
	});
});

describe("enhancement configs on one pipeline", () => {
	it("doubles the opening answer's coverage with Cold Start", () => {
		let state = started(["cold-start"]);
		state = answerWith(state, true);
		expect(state.coverage).toBe(2.2); // 1 × opener ×2 × streak 1.1
		state = answerWith(state, true);
		expect(state.coverage).toBe(3.4); // +1.2 — the doubling was opener-only
	});

	it("stops the IndexedDB faucet at the per-run cap", () => {
		let state = started(["indexed-db"]);
		state = { ...state, faucetEarnedKb: FAUCET_CAP_KB - 4 };
		state = answerWith(state, true); // only 4KB of headroom left
		expect(state.storage).toBe(4);
		expect(state.faucetEarnedKb).toBe(FAUCET_CAP_KB);
		state = answerWith(state, true); // the faucet has run dry
		expect(state.storage).toBe(4);
	});
});

describe("the summit", () => {
	it("wins by clearing every gate — playing the mirror wrong on purpose", () => {
		const base = started(["js"], GATE_COUNT * SLICE_WINDOW);
		// The mirror pays no streak, so Marsh and Elite demand a real multiplier
		// build: AGENTS.md ×2 with Coverage ×2 carries a perfect mirror window,
		// and enough width that Dependency Outage cannot take both.
		let state: RunState = {
			...base,
			pipeline: {
				...base.pipeline,
				slots: 6,
				configs: [
					...base.pipeline.configs,
					CONFIGS.agentsMd,
					CONFIGS.coverageGain,
					// Elite's mirror forces five wrong answers, so the Champion opens
					// on a cold streak: 340% off streakless multipliers alone lands two
					// points short, and this is what covers the gap.
					CONFIGS.codeCoverage,
				],
			},
		};
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			const mirrored = auditsForGate(gate).some(
				(audit) => audit.id === "mirrored"
			);
			for (let i = 0; i < SLICE_WINDOW; i++)
				state = answerWith(state, !mirrored);
			if (state.status === "rewarding")
				state = runReducer(state, { type: "finish-reward" });
		}
		expect(state.status).toBe("won");
		expect(state.clearedGate).toBe(VICTORY_GATE); // the last gate's number
		expect(state.gatesCleared).toBe(GATE_COUNT); // every gate banked
	});
});

describe("depth and width are independent (ADR-019)", () => {
	it("advances the gate on a clear the starting three slots paid for", () => {
		const state = clearGate(started(["js"]));

		expect(state.status).toBe("rewarding");
		expect(state.gatesCleared).toBe(1); // the clear advanced it, nothing else
		expect(state.clearedGate).toBe(0); // and names the gate it beat
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

		// Width auto-claims itself off coverage alone (ADR-025) and never blocks
		// or requires a clear, so depth just keeps advancing regardless of it.
		expect(state.gatesCleared).toBe(3);
		expect(state.pipeline.slots).toBeGreaterThanOrEqual(BASE_SLOTS);
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
		let state: RunState = {
			...createRun([poll("a", true), poll("b", true), multi], handed),
			status: "answering", // bare pipeline on purpose: base earn only
		};
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
		expect(baseAt(0, false)).toBe(-0.5); // gate 1: half of the 1 it pays
		expect(baseAt(1, false)).toBe(-1); // gate 2: half of 2
		expect(baseAt(4, false)).toBe(-2.5); // gate 5: half of 5
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
	// Priced off what a correct answer pays on THIS build, so stacking coverage
	// multipliers can no longer buy near-immunity to being wrong.
	it("bleeds coverage on a wrong answer, at half of what a right one pays", () => {
		const afterOneCorrect = answerWith(started(["js"]), true);
		expect(afterOneCorrect.coverage).toBe(1.1); // base 1 × streak-1 factor 1.1
		// .js multiplies nothing build-wide, so a correct answer pays 1 and a
		// wrong one costs 0.5.
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
		const afterOneCorrect = answerWith(started(["js"]), true); // react 1.1
		const thenWrong = answerWith(afterOneCorrect, false); // react 1.1 → 0.8
		expect(thenWrong.coverage).toBe(
			Object.values(thenWrong.coverageByCategory).reduce(
				(sum, pct) => sum + pct,
				0
			)
		);
	});

	it("bleeds the gate meter and the career total in step (ADR-035)", () => {
		// The meter is the gate's score, so the loss hits it too — a bad answer
		// costs the attempt exactly what it costs the run.
		const afterOneCorrect = answerWith(started(["js"]), true);
		const thenWrong = answerWith(afterOneCorrect, false);
		expect(thenWrong.window.coverageGained).toBe(0.6); // 1.1 − 0.5 loss
		expect(thenWrong.coverage).toBe(0.6);
	});
});

describe("Moore's Law", () => {
	const held = (state: RunState, storage: number): RunState => ({
		...state,
		storage,
	});
	const maxed = (state: RunState): RunState => ({
		...state,
		pipeline: {
			...state.pipeline,
			configs: state.pipeline.configs.map((config) =>
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
		expect(state.interestThisGateKb).toBe(2); // 2% of 128, rounded down
		expect(state.gateRewardKb).toBe(32 + 2);
		expect(state.storage).toBe(128 + 34);
	});

	it("pays five times as much once maxed, on the same balance", () => {
		const state = answerWholeWindow(maxed(held(started(["moores-law"]), 512)));

		expect(state.interestThisGateKb).toBe(51); // 10% at L5
	});

	it("pays interest on any balance — the floor left with the checks (ADR-035)", () => {
		const state = answerWholeWindow(held(started(["moores-law"]), 31));

		expect(state.status).toBe("rewarding");
		expect(state.interestThisGateKb).toBe(0); // 2% of 31 floors to 0KB
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

		expect(state.storage).toBe(200 - 64); // 32KB × the level bought
		expect(
			state.pipeline.configs.find((config) => config.id === "moores-law")?.level
		).toBe(2);
	});

	// The free plan's 512KB cap burns everything above it when the shop closes
	// (ADR-023), so interest on a full balance is shop budget, not principal.
	it("cannot compound on a capped plan — the burn takes the interest back", () => {
		let state = answerWholeWindow(
			maxed(held(started(["moores-law"], 4 * SLICE_WINDOW), 512))
		);
		expect(state.storage).toBe(512 + 51 + 32);

		state = runReducer(state, { type: "finish-reward" });
		expect(state.storage).toBe(512);

		state = answerWholeWindow(state);
		expect(state.interestThisGateKb).toBe(51); // the same tenth, again
	});

	it("compounds once a bigger plan leaves the balance room to grow", () => {
		const onTier2: RunState = {
			...maxed(held(started(["moores-law"], 4 * SLICE_WINDOW), 512)),
			storagePlan: 2, // 640KB cap, billed 8KB a gate
		};
		let state = answerWholeWindow(onTier2);
		const first = state.interestThisGateKb ?? 0;
		state = runReducer(state, { type: "finish-reward" });
		state = answerWholeWindow(state);

		expect(first).toBe(50); // 10% of 504, the balance after the 8KB bill
		expect(state.interestThisGateKb).toBeGreaterThan(first);
	});
});

// Dependabot's merge is announced through `autoUpgradedConfigId` — the run log
// never shows in the live game (roll + pick behaviour lives in
// autoUpgrade.model.spec; here only the announcement's lifetime).
describe("Dependabot's merge announcement", () => {
	it("stays unset when nothing in the pipeline carries the axis", () => {
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
			pipeline: {
				...base.pipeline,
				slots: base.pipeline.configs.length + 1,
				configs: [
					...base.pipeline.configs,
					{ ...CONFIGS.deprecated, coverageMultiplier: multiplier },
				],
			},
		};
	};

	const deprecatedIn = (state: RunState) =>
		state.pipeline.configs.find((config) => config.id === "deprecated");

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
	// The opening gate, the only depth a three-config build clears outright — the
	// bill's own ladder is priced in subscription.model.spec.ts, so these tests
	// vary the plan's price rather than the gate, and read the wiring.
	/** A plan no opening clear can cover, so insolvency is reachable at gate 0. */
	const unaffordablePlan: Config = { ...CONFIGS.freemium, subscriptionKb: 512 };

	const subscribed = (
		storage: number,
		plan: Config = CONFIGS.freemium
	): RunState => {
		const base = started(["js"]);
		return {
			...base,
			storage,
			pipeline: {
				...base.pipeline,
				slots: base.pipeline.configs.length + 1,
				configs: [...base.pipeline.configs, plan],
			},
		};
	};

	const freemiumIn = (state: RunState) =>
		state.pipeline.configs.find((config) => config.id === "freemium");

	it("bills 8KB at the first clear and keeps the plan installed", () => {
		const state = clearGate(subscribed(128));
		expect(state.subscriptionBillKb).toBe(8);
		expect(freemiumIn(state)).toBeDefined();
		expect(state.lapsedConfigs).toBeUndefined();
	});

	it("bills after the gate pays, so the clear itself can cover the plan", () => {
		// Nothing in hand walking in: a bill charged before the reward was credited
		// would lapse a plan this very clear paid for.
		const state = clearGate(subscribed(0));
		expect(state.subscriptionBillKb).toBe(8);
		expect(freemiumIn(state)).toBeDefined();
	});

	it("lapses the plan when the clear cannot cover the bill, and frees the slot", () => {
		const state = clearGate(subscribed(0, unaffordablePlan));
		expect(freemiumIn(state)).toBeUndefined();
		expect(state.lapsedConfigs).toHaveLength(1);
		expect(state.subscriptionBillKb).toBe(0);
		expect(state.pipeline.configs).toHaveLength(3);
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
			pipeline: { ...cleared.pipeline, slots: 8 },
		};
		const drafted = runReducer(shopping, {
			type: "draft",
			configId: "agents-md",
		});
		expect(drafted.storage).toBe(shopping.storage - 128);
	});
});

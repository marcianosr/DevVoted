import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	accuracyViewFor,
	bestMultiplierOf,
	guaranteedMultiplierOf,
	guaranteedWindowOutputOf,
	liveMultiplierOf,
} from "~/modules/run/run/application/gateStake.viewmodel";
import {
	accuracyOf,
	windowOutputOf,
} from "~/modules/run/gate/domain/gate.model";
import {
	ACCURACY_GAIN_PER_GATE,
	accuracyMultiplierFor,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	answerWith,
	audited,
	failGate,
	payPeel,
	started,
} from "~/modules/run/run/domain/run.factory";
import type { RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";

const RETRY_GATE = 7;

const atRetriedGate = (): RunState => {
	const opening = started(["js"]);
	const wide = {
		...opening,
		build: {
			...opening.build,
			configs: [
				...opening.build.configs,
				CONFIGS.telemetry,
				CONFIGS.unitTests,
				CONFIGS.indexedDb,
			],
		},
	};
	return runReducer(payPeel(failGate(audited(wide, RETRY_GATE))), {
		type: "finish-reward",
	});
};

describe("what the stake says a miss takes", () => {
	it("escalates on a retried gate exactly as the close does", () => {
		const retried = atRetriedGate();
		const promised = toRunView(retried).gateStake.peelSlotsOnFailure;

		expect(retried.gateAttempts).toBe(1);
		expect(failGate(retried).peelSlotsRemaining).toBe(promised);
	});
});

describe("the accuracy track (ADR-169)", () => {
	it("draws no group for a skipped poll", () => {
		const answered = answerWith(started(["js"]), true);
		const skipped = runReducer(answered, { type: "skip" });

		expect(accuracyViewFor(answered).polls).toHaveLength(1);
		expect(accuracyViewFor(skipped).polls).toHaveLength(1);
	});
});

const answeredRight = (state: RunState): RunState => {
	const current = state.polls[state.currentIndex];
	const right = current.options.find((option) => option.correct);
	if (!right) throw new Error("no right option");
	return runReducer(state, { type: "answer", optionIds: [right.id] });
};

const CARRIED_BONUS = 0.4;

const carrying = (): RunState => ({
	...started(["js"]),
	accuracyBonus: CARRIED_BONUS,
});

const heldAfter = (state: RunState): number =>
	toRunView(state).gateStake.coverageHeld;

describe("the meter holds the guaranteed floor", () => {
	it("prices the polls ahead as missed multiples while the mix is unseen", () => {
		const twoRight = answerWith(answerWith(carrying(), true), true);

		expect(guaranteedWindowOutputOf(twoRight)).toBeCloseTo(
			2 * accuracyMultiplierFor(CARRIED_BONUS, { earned: 2, available: 8 })
		);
	});

	it("reads what the close pays once the fifth answer is in", () => {
		let state = started(["js"]);
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		const fifth = answeredRight(state);

		expect(guaranteedWindowOutputOf(fifth)).toBe(
			windowOutputOf(fifth.window, fifth.accuracyBonus)
		);
		expect(heldAfter(fifth)).toBe(100);
	});

	it("never falls on a wrong answer", () => {
		const outcomes = [true, false, true, false, true];
		const held = outcomes.reduce<{ state: RunState; readings: number[] }>(
			({ state, readings }, correct) => {
				const next = answerWith(state, correct);
				return { state: next, readings: [...readings, heldAfter(next)] };
			},
			{ state: started(["js"]), readings: [heldAfter(started(["js"]))] }
		).readings;

		held
			.slice(1, -1)
			.forEach((reading, index) =>
				expect(reading).toBeGreaterThanOrEqual(held[index])
			);
	});

	it("rises on a skip, because a skip keeps the multiplier", () => {
		const oneRight = answerWith(carrying(), true);
		const skipped = runReducer(oneRight, { type: "skip" });

		expect(guaranteedWindowOutputOf(skipped)).toBeGreaterThan(
			guaranteedWindowOutputOf(oneRight)
		);
	});
});

describe("the accuracy reading", () => {
	it("reads ×1 sure and one plus the gain at best on a fresh run's empty window", () => {
		const fresh = started(["js"]);

		expect(guaranteedMultiplierOf(fresh)).toBe(1);
		expect(bestMultiplierOf(fresh)).toBe(1 + ACCURACY_GAIN_PER_GATE);
	});

	it("never raises the best case on a miss", () => {
		const oneRight = answerWith(started(["js"]), true);
		const thenMissed = answerWith(oneRight, false);

		expect(bestMultiplierOf(thenMissed)).toBeLessThan(
			bestMultiplierOf(oneRight)
		);
	});

	it("meets the floor at the close's multiplier once the fifth answer is in", () => {
		let state = started(["js"]);
		for (let i = 0; i < 4; i++) state = answerWith(state, i !== 1);
		const fifth = answeredRight(state);
		const closes = accuracyMultiplierFor(
			fifth.accuracyBonus,
			accuracyOf(fifth.window)
		);

		expect(guaranteedMultiplierOf(fifth)).toBeCloseTo(closes);
		expect(bestMultiplierOf(fifth)).toBeCloseTo(closes);
	});

	it("states both on the stake the poll screen reads", () => {
		const twoRight = answerWith(answerWith(started(["js"]), true), true);

		expect(accuracyViewFor(twoRight)).toMatchObject({
			guaranteed: guaranteedMultiplierOf(twoRight),
			best: bestMultiplierOf(twoRight),
		});
	});
});

describe("the live accuracy bonus under the gate's cap (ADR-198)", () => {
	const after = (outcomes: readonly boolean[], from = carrying()) =>
		outcomes.reduce(answerWith, from);
	const mixKnown = () => audited(carrying(), 4, "multi-status");

	it("starts the gate at the bonus the run carried", () => {
		expect(liveMultiplierOf(carrying())).toBeCloseTo(1 + CARRIED_BONUS);
	});

	it("raises the bonus a fifth of the gate's gain on a right answer, under the cap", () => {
		expect(liveMultiplierOf(after([true]))).toBeCloseTo(
			1 + CARRIED_BONUS + ACCURACY_GAIN_PER_GATE / 5
		);
	});

	it("leaves the bonus where it was on a wrong answer, and lowers the cap", () => {
		const oneRight = after([true]);
		const thenWrong = answerWith(oneRight, false);

		expect(liveMultiplierOf(thenWrong)).toBeCloseTo(liveMultiplierOf(oneRight));
		expect(bestMultiplierOf(thenWrong)).toBeLessThan(
			bestMultiplierOf(oneRight)
		);
	});

	it("never reads above the gate's cap", () => {
		const outcomes = [false, false, true, true, true];
		outcomes.forEach((_, index) => {
			const state = after(outcomes.slice(0, index + 1));
			expect(liveMultiplierOf(state)).toBeLessThanOrEqual(
				bestMultiplierOf(state) + 1e-9
			);
		});
	});

	it("stops rising once it meets the cap", () => {
		const atCap = after([false, false, true, true], mixKnown());
		const another = answerWith(atCap, true);

		expect(liveMultiplierOf(atCap)).toBeCloseTo(bestMultiplierOf(atCap));
		expect(liveMultiplierOf(another)).toBeLessThanOrEqual(
			liveMultiplierOf(atCap) + 1e-9
		);
	});

	it("drops with the cap when a wrong answer comes at the cap", () => {
		const atCap = after([false, false, true, true], mixKnown());
		const thenWrong = answerWith(atCap, false);

		expect(liveMultiplierOf(thenWrong)).toBeLessThan(liveMultiplierOf(atCap));
		expect(liveMultiplierOf(thenWrong)).toBeCloseTo(
			bestMultiplierOf(thenWrong)
		);
	});

	it.each([
		[[true, true, true, true]],
		[[true, false, false, true]],
		[[false, false, false, false]],
		[[true, true, false, true]],
	])("closes on the formula the gate pays: %j then a right fifth", (four) => {
		const fifth = answeredRight(after(four));
		const closes = accuracyMultiplierFor(
			fifth.accuracyBonus,
			accuracyOf(fifth.window)
		);

		expect(liveMultiplierOf(fifth)).toBeCloseTo(closes);
	});

	it("states the live bonus on the stake the poll screen reads", () => {
		const twoRight = after([true, true]);

		expect(accuracyViewFor(twoRight).live).toBe(liveMultiplierOf(twoRight));
	});
});

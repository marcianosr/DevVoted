import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	accuracyViewFor,
	bestMultiplierOf,
	guaranteedMultiplierOf,
	guaranteedWindowOutputOf,
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

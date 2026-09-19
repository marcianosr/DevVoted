import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	canEstimate,
	commitEstimate,
	ESTIMATE_CHOICES,
	estimatePayoutUnits,
	estimatorFor,
} from "~/modules/run/run/domain/estimate.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	floorAt,
	healthyAt,
	scoringSlotsAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import { answerWith, handed, pool } from "~/modules/run/run/domain/run.factory";

const prepping = (...configIds: string[]): RunState => {
	const base = createRun(pool(20), [...handed, CONFIGS.planningPoker]);
	return configIds.reduce(
		(state, configId) => runReducer(state, { type: "install", configId }),
		base
	);
};

const withPlanningPoker = (): RunState => prepping("planning-poker");

describe("the config that takes the estimate", () => {
	it("names Planning Poker once it is installed", () => {
		expect(estimatorFor(withPlanningPoker().build.configs)).toEqual(
			CONFIGS.planningPoker
		);
	});

	it("finds nobody to estimate for without it", () => {
		expect(estimatorFor(prepping("js").build.configs)).toBeUndefined();
	});
});

describe("when an estimate can be made", () => {
	it("takes one at the run's start and at every prep hub after it", () => {
		expect(canEstimate({ status: "configuring" })).toBe(true);
		expect(canEstimate({ status: "rewarding" })).toBe(true);
	});

	it("refuses one from a gate already under way", () => {
		expect(canEstimate({ status: "answering" })).toBe(false);
	});
});

describe("committing an estimate", () => {
	it("records the count the player committed to", () => {
		expect(commitEstimate(withPlanningPoker(), 3).estimatedCorrect).toBe(3);
	});

	it("replaces an earlier estimate while the gate has not started", () => {
		const first = commitEstimate(withPlanningPoker(), 3);
		expect(commitEstimate(first, 5).estimatedCorrect).toBe(5);
	});

	it("offers one press per poll in the window, never a nothing bet", () => {
		expect(ESTIMATE_CHOICES).toEqual([1, 2, 3, 4, 5]);
	});

	it("refuses a count outside the window", () => {
		const state = withPlanningPoker();
		expect(commitEstimate(state, 0)).toBe(state);
		expect(commitEstimate(state, 6)).toBe(state);
	});

	it("refuses a count that is not a whole number of polls", () => {
		const state = withPlanningPoker();
		expect(commitEstimate(state, 2.5)).toBe(state);
	});

	it("refuses a player who has not installed the config", () => {
		const state = prepping("js");
		expect(commitEstimate(state, 3)).toBe(state);
	});

	it("refuses once the first answer has landed", () => {
		const state: RunState = { ...withPlanningPoker(), status: "answering" };
		expect(commitEstimate(state, 3)).toBe(state);
	});
});

describe("what the estimate pays at gate resolution", () => {
	const configs = [CONFIGS.planningPoker];
	const GATE_0 = 0;

	it("pays a quarter unit per point bet, per gate deep, when the floor is met", () => {
		expect(estimatePayoutUnits(configs, 1, 1, GATE_0)).toBe(0.25);
		expect(estimatePayoutUnits(configs, 4, 4, GATE_0)).toBe(1);
		expect(estimatePayoutUnits(configs, 5, 5, GATE_0)).toBe(1.25);
	});

	it("pays a window that beat its own call, because the number is a floor", () => {
		expect(estimatePayoutUnits(configs, 3, 4, GATE_0)).toBe(0.75);
		expect(estimatePayoutUnits(configs, 1, 5, GATE_0)).toBe(0.25);
	});

	it("pays nothing to a window that fell one short", () => {
		expect(estimatePayoutUnits(configs, 4, 3, GATE_0)).toBe(0);
	});

	it("scales with depth, so the same card holds its share of a growing line", () => {
		expect(estimatePayoutUnits(configs, 5, 5, 4)).toBe(6.25);
		expect(estimatePayoutUnits(configs, 5, 5, 12)).toBe(16.25);
	});

	it("pays a minified estimator half, without flooring the fraction away", () => {
		const minified = [{ ...CONFIGS.planningPoker, minified: true }];
		expect(estimatePayoutUnits(minified, 5, 5, GATE_0)).toBe(0.625);
	});

	it("pays nothing when no estimate was committed", () => {
		expect(estimatePayoutUnits(configs, undefined, 4, GATE_0)).toBe(0);
	});

	it("pays nothing without the config, whatever was committed", () => {
		expect(estimatePayoutUnits([CONFIGS.js], 4, 4, GATE_0)).toBe(0);
	});
});

const answering = (estimate?: number): RunState => {
	let state = prepping("planning-poker", "js");
	if (estimate !== undefined)
		state = runReducer(state, { type: "estimate", count: estimate });
	return runReducer(state, { type: "start" });
};

const answerGate = (state: RunState, rightCount: number): RunState => {
	let next = state;
	for (let index = 0; index < SLICE_WINDOW; index++)
		next = answerWith(next, index < rightCount);
	return next;
};

describe("an estimate crossing the start of a gate", () => {
	const cleared = (): RunState => answerGate(answering(5), SLICE_WINDOW);

	it("survives the press that starts the next gate", () => {
		const committed = runReducer(cleared(), { type: "estimate", count: 2 });
		expect(
			runReducer(committed, { type: "finish-reward" }).estimatedCorrect
		).toBe(2);
	});

	it("lets the retry after a miss make a fresh call", () => {
		const missed = answerGate(answering(1), 1);
		const retrying = runReducer(missed, { type: "resume-climb" });
		expect(retrying.status).toBe("rewarding");
		expect(retrying.estimatedCorrect).toBeUndefined();
		expect(
			runReducer(retrying, { type: "estimate", count: 3 }).estimatedCorrect
		).toBe(3);
	});
});

describe("the gate settling an estimate", () => {
	it("pays the cleared gate in coverage, on top of its own reward", () => {
		const settled = answerGate(answering(5), SLICE_WINDOW);
		expect(settled.status).toBe("rewarding");
		expect(settled.estimateThisGateUnits).toBe(1.25);
	});

	it("banks the won bet as coverage where the gate has room for it", () => {
		// Banked on the healthy line so BOTH runs clear and the gap between them
		// is the bet alone, and under the line's 25 slots so neither is clamped.
		const GATE = 4;
		const bet = {
			...answering(5),
			gatesCleared: GATE,
			bankedUnits: healthyAt(GATE) * scoringSlotsAt(GATE),
		};
		const withBet = answerGate(bet, SLICE_WINDOW);
		const noBet = answerGate(
			{ ...bet, estimatedCorrect: undefined },
			SLICE_WINDOW
		);
		expect(withBet.bankedUnits - noBet.bankedUnits).toBe(6.25);
	});

	// Gate 0 opens only five slots and a flawless window already fills them, so
	// this is the one place the overflow is reachable without a deep build.
	it("spills a bet past the gate line into storage instead of wasting it", () => {
		const withBet = answerGate(answering(5), SLICE_WINDOW);
		const noBet = answerGate(
			{ ...answering(5), estimatedCorrect: undefined },
			SLICE_WINDOW
		);
		expect(withBet.bankedUnits).toBe(noBet.bankedUnits);
		expect(withBet.storage).toBeGreaterThan(noBet.storage);
	});

	it("pays a missed gate too, which is the only thing a low estimate is for", () => {
		// Banked low enough that one right answer plus the won bet still lands
		// under the OK line while staying above the floor, which would end the
		// run (ADR-076).
		const MISSED_GATE = 4;
		const UNDER_THE_LINE = 2;
		const start: RunState = {
			...answering(1),
			gatesCleared: MISSED_GATE,
			bankedUnits:
				floorAt(MISSED_GATE) * scoringSlotsAt(MISSED_GATE) - UNDER_THE_LINE,
		};
		const settled = answerGate(start, 1);
		expect(settled.status).toBe("awaiting-strip");
		expect(settled.estimateThisGateUnits).toBe(1.25);
	});

	it("lets a won bet lift a gate over its own line, which is what settling it inside the window is for", () => {
		const GATE = 4;
		const onTheFloor: RunState = {
			...answering(1),
			gatesCleared: GATE,
			bankedUnits: floorAt(GATE) * scoringSlotsAt(GATE),
		};
		const withBet = answerGate(onTheFloor, 1);
		const withoutBet = answerGate(
			{ ...onTheFloor, estimatedCorrect: undefined },
			1
		);

		expect(withBet.status).toBe("rewarding");
		expect(withoutBet.status).toBe("awaiting-strip");
	});

	it("pays a cleared gate nothing when the window fell short of the call", () => {
		const settled = answerGate(answering(5), SLICE_WINDOW - 1);
		expect(settled.estimateThisGateUnits).toBe(0);
	});

	it("leaves no bet on the record for a player who committed nothing", () => {
		const settled = answerGate(answering(), SLICE_WINDOW);
		expect(settled.estimateThisGateUnits).toBeUndefined();
	});

	it("clears the estimate afterwards, so the next window is uncommitted", () => {
		expect(
			answerGate(answering(5), SLICE_WINDOW).estimatedCorrect
		).toBeUndefined();
		expect(answerGate(answering(1), 1).estimatedCorrect).toBeUndefined();
	});
});

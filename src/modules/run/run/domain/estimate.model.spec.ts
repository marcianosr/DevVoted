import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	canEstimate,
	commitEstimate,
	ESTIMATE_CHOICES,
	estimatePayoutKb,
	estimatorFor,
} from "~/modules/run/run/domain/estimate.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
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

	it("pays 32KB per poll estimated when the count was exact", () => {
		expect(estimatePayoutKb(configs, 4, 4)).toBe(128);
		expect(estimatePayoutKb(configs, 1, 1)).toBe(32);
		expect(estimatePayoutKb(configs, 5, 5)).toBe(160);
	});

	it("pays nothing to a window that fell short of the estimate", () => {
		expect(estimatePayoutKb(configs, 4, 3)).toBe(0);
	});

	it("pays nothing to a window that beat the estimate either", () => {
		expect(estimatePayoutKb(configs, 3, 4)).toBe(0);
	});

	it("pays nothing when no estimate was committed", () => {
		expect(estimatePayoutKb(configs, undefined, 4)).toBe(0);
	});

	it("pays nothing without the config, whatever was committed", () => {
		expect(estimatePayoutKb([CONFIGS.js], 4, 4)).toBe(0);
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
	it("pays the cleared gate on top of its own reward", () => {
		const settled = answerGate(answering(5), SLICE_WINDOW);
		expect(settled.status).toBe("rewarding");
		expect(settled.estimateThisGateKb).toBe(160);
	});

	it("pays a missed gate too, which is the only thing a low estimate is for", () => {
		const start = answering(1);
		const settled = answerGate(start, 1);
		expect(settled.status).toBe("awaiting-strip");
		expect(settled.estimateThisGateKb).toBe(32);
		expect(settled.storage).toBe(start.storage + 32);
	});

	it("pays a cleared gate nothing when the estimate was under", () => {
		const settled = answerGate(answering(3), SLICE_WINDOW);
		expect(settled.estimateThisGateKb).toBe(0);
	});

	it("leaves no bet on the record for a player who committed nothing", () => {
		const settled = answerGate(answering(), SLICE_WINDOW);
		expect(settled.estimateThisGateKb).toBeUndefined();
	});

	it("clears the estimate afterwards, so the next window is uncommitted", () => {
		expect(
			answerGate(answering(5), SLICE_WINDOW).estimatedCorrect
		).toBeUndefined();
		expect(answerGate(answering(1), 1).estimatedCorrect).toBeUndefined();
	});
});

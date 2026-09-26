import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { RunState } from "~/modules/run/run/domain/run.model";
import { started } from "~/modules/run/run/domain/run.factory";
import {
	armStrict,
	strictSettlementFor,
	strictStakeOf,
} from "~/modules/run/run/domain/strict.model";

const STAKE = 0.5;

const wagering = (): RunState => {
	const base = started(["js"]);
	return { ...base, build: { ...base.build, configs: [CONFIGS.strict] } };
};

const unwagering = (): RunState => {
	const base = started(["js"]);
	return { ...base, build: { ...base.build, configs: [CONFIGS.js] } };
};

describe("strictStakeOf", () => {
	it("reads the stake off the config that wagers", () => {
		expect(strictStakeOf([CONFIGS.js, CONFIGS.strict])).toBe(STAKE);
	});

	it("returns nothing when no config in the build wagers", () => {
		expect(strictStakeOf([CONFIGS.js, CONFIGS.codeCoverage])).toBeUndefined();
	});
});

describe("strictSettlementFor", () => {
	const settle = (armed: boolean, outcome: "correct" | "partial" | "wrong") =>
		strictSettlementFor([CONFIGS.strict], armed, outcome);

	it("pays the stake on an exact answer", () => {
		expect(settle(true, "correct")).toEqual({ bonus: STAKE, loss: 0 });
	});

	it("charges the stake on a partial, since strict means exact or nothing", () => {
		expect(settle(true, "partial")).toEqual({ bonus: 0, loss: STAKE });
	});

	it("charges the stake on a miss", () => {
		expect(settle(true, "wrong")).toEqual({ bonus: 0, loss: STAKE });
	});

	it("settles nothing when the wager was never armed", () => {
		expect(settle(false, "correct")).toEqual({ bonus: 0, loss: 0 });
		expect(settle(false, "wrong")).toEqual({ bonus: 0, loss: 0 });
	});

	it("settles nothing when the build holds no wagering config", () => {
		expect(strictSettlementFor([CONFIGS.js], true, "wrong")).toEqual({
			bonus: 0,
			loss: 0,
		});
	});
});

describe("armStrict", () => {
	it("arms a build that holds the wager", () => {
		expect(armStrict(wagering()).strictArmed).toBe(true);
	});

	it("disarms an armed wager, so the press is a toggle", () => {
		expect(armStrict(armStrict(wagering())).strictArmed).toBe(false);
	});

	it("refuses a build with nothing to wager", () => {
		const state = unwagering();
		expect(armStrict(state)).toBe(state);
	});
});

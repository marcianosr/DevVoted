import { describe, expect, it } from "vitest";

import { GATE_COUNT, VICTORY_GATE } from "../rules.model";
import { deriveGateLadder } from "./gateLadder.model";

describe(deriveGateLadder, () => {
	it("marks cleared gates pass, the stall gate fail, and the rest skip", () => {
		// Gates count from 0, so two cleared means gates 0 and 1 passed and the
		// player broke on gate 2.
		expect(deriveGateLadder(2, false, 4)).toEqual([
			{ gate: 0, status: "pass" },
			{ gate: 1, status: "pass" },
			{ gate: 2, status: "fail" },
			{ gate: 3, status: "skip" },
			{ gate: 4, status: "skip" },
		]);
	});

	it("passes every gate on a won run with no fail or skip", () => {
		// A won run banked all five, so `gatesCleared` is the count, not the last
		// gate's number.
		expect(deriveGateLadder(5, true, 4)).toEqual([
			{ gate: 0, status: "pass" },
			{ gate: 1, status: "pass" },
			{ gate: 2, status: "pass" },
			{ gate: 3, status: "pass" },
			{ gate: 4, status: "pass" },
		]);
	});

	it("fails the opening gate when the run breaks before clearing any", () => {
		expect(deriveGateLadder(0, false, 2)).toEqual([
			{ gate: 0, status: "fail" },
			{ gate: 1, status: "skip" },
			{ gate: 2, status: "skip" },
		]);
	});

	it("defaults to the whole run — gate 0 through the summit", () => {
		const ladder = deriveGateLadder(1, false);
		expect(ladder).toHaveLength(GATE_COUNT);
		expect(ladder.at(-1)?.gate).toBe(VICTORY_GATE);
	});

	it("blames the gate the run died on and skips the rest", () => {
		// Two gates banked, so gate 2 is the one underway when the build broke.
		const ladder = deriveGateLadder(2, false, VICTORY_GATE);
		expect(ladder[2]).toEqual({ gate: 2, status: "fail" });
		expect(ladder.slice(3).every(({ status }) => status === "skip")).toBe(true);
	});
});

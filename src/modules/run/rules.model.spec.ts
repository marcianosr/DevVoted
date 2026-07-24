import { describe, expect, it } from "vitest";

import {
	pollDifficultyMultiplier,
	storageCreditRate,
	VICTORY_GATE,
} from "./rules.model";

describe("storageCreditRate", () => {
	it("banks everything on a victory", () => {
		expect(storageCreditRate("victory", VICTORY_GATE)).toBe(1);
	});

	it("banks nothing on an abandon, however far the climb got", () => {
		expect(storageCreditRate("abandoned", 0)).toBe(0);
		expect(storageCreditRate("abandoned", VICTORY_GATE - 1)).toBe(0);
	});

	it("scales a death linearly with gates cleared", () => {
		expect(storageCreditRate("dead", 0)).toBe(0);
		expect(storageCreditRate("dead", VICTORY_GATE / 2)).toBeCloseTo(0.5);
		expect(storageCreditRate("dead", VICTORY_GATE - 1)).toBeCloseTo(
			(VICTORY_GATE - 1) / VICTORY_GATE
		);
	});

	it("never pays more than the full leftovers", () => {
		expect(storageCreditRate("dead", VICTORY_GATE + 3)).toBe(1);
	});
});

describe("pollDifficultyMultiplier", () => {
	it("pays the baseline ×1.0 for a 3-option single-choice poll", () => {
		expect(pollDifficultyMultiplier(3, false)).toBe(1);
	});

	it("never dips below ×1.0 for fewer-than-baseline options", () => {
		expect(pollDifficultyMultiplier(2, false)).toBe(1);
	});

	it("adds a step of coverage per option beyond the baseline", () => {
		expect(pollDifficultyMultiplier(5, false)).toBeCloseTo(1.2);
		expect(pollDifficultyMultiplier(8, false)).toBeCloseTo(1.5);
	});

	it("adds a flat bonus for multiple-choice on top of the option steps", () => {
		expect(pollDifficultyMultiplier(3, true)).toBeCloseTo(1.5);
		expect(pollDifficultyMultiplier(6, true)).toBeCloseTo(1.8);
		expect(pollDifficultyMultiplier(8, true)).toBeCloseTo(2);
	});
});

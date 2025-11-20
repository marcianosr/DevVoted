import { describe, it, expect } from "vitest";

import { STORAGE_UNITS } from "~/lib/storage";

import { calculateRerollCost } from "./reroll.service";

describe("reroll.service", () => {
	describe("calculateRerollCost", () => {
		it("calculates fibonacci sequence correctly", () => {
			expect(calculateRerollCost(0)).toBe(1 * STORAGE_UNITS.KB);
			expect(calculateRerollCost(1)).toBe(1 * STORAGE_UNITS.KB);
			expect(calculateRerollCost(2)).toBe(2 * STORAGE_UNITS.KB);
			expect(calculateRerollCost(3)).toBe(3 * STORAGE_UNITS.KB);
			expect(calculateRerollCost(4)).toBe(5 * STORAGE_UNITS.KB);
			expect(calculateRerollCost(5)).toBe(8 * STORAGE_UNITS.KB);
			expect(calculateRerollCost(6)).toBe(13 * STORAGE_UNITS.KB);
		});

		it("handles negative numbers", () => {
			expect(calculateRerollCost(-1)).toBe(0);
			expect(calculateRerollCost(-10)).toBe(0);
		});
	});
});

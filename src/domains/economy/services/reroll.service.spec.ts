import { describe, it, expect } from "vitest";
import { calculateRerollCost, getTotalRerollsCost, canAffordReroll } from "./reroll.service";
import { STORAGE_UNITS } from "~/lib/storage";

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

	describe("getTotalRerollsCost", () => {
		it("calculates total cost for multiple rerolls", () => {
			expect(getTotalRerollsCost(0)).toBe(0);
			expect(getTotalRerollsCost(1)).toBe(1 * STORAGE_UNITS.KB);
			expect(getTotalRerollsCost(2)).toBe(2 * STORAGE_UNITS.KB);
			expect(getTotalRerollsCost(3)).toBe(4 * STORAGE_UNITS.KB);
			expect(getTotalRerollsCost(5)).toBe(12 * STORAGE_UNITS.KB);
		});
	});

	describe("canAffordReroll", () => {
		it("checks if storage is sufficient for reroll", () => {
			expect(canAffordReroll(1 * STORAGE_UNITS.KB, 0)).toBe(true);
			expect(canAffordReroll(1 * STORAGE_UNITS.KB, 1)).toBe(true);
			expect(canAffordReroll(1 * STORAGE_UNITS.KB, 2)).toBe(false);
			expect(canAffordReroll(5 * STORAGE_UNITS.KB, 4)).toBe(true);
			expect(canAffordReroll(4 * STORAGE_UNITS.KB, 4)).toBe(false);
		});
	});
});
import { describe, it, expect } from "vitest";

import { calculateLevelAndCoverage } from "./levelCalculations";

describe("levelCalculations", () => {
	describe("calculateLevelAndCoverage", () => {
		it("returns L1 for coverage under 100%", () => {
			const result = calculateLevelAndCoverage(50);

			expect(result.level).toBe(1);
			expect(result.displayCoverage).toBe(50);
			expect(result.effectiveCoverage).toBe(50);
		});

		it("returns L1 for zero coverage", () => {
			const result = calculateLevelAndCoverage(0);

			expect(result.level).toBe(1);
			expect(result.displayCoverage).toBe(0);
			expect(result.effectiveCoverage).toBe(0);
		});

		it("returns L2 at exactly 100%", () => {
			const result = calculateLevelAndCoverage(100);

			expect(result.level).toBe(2);
			expect(result.displayCoverage).toBe(0);
			expect(result.effectiveCoverage).toBe(100);
		});

		it("returns L2 with display coverage for 127%", () => {
			const result = calculateLevelAndCoverage(127);

			expect(result.level).toBe(2);
			expect(result.displayCoverage).toBe(27);
			expect(result.effectiveCoverage).toBe(127);
		});

		it("returns L3 for 250%", () => {
			const result = calculateLevelAndCoverage(250);

			expect(result.level).toBe(3);
			expect(result.displayCoverage).toBe(50);
			expect(result.effectiveCoverage).toBe(250);
		});

		it("handles high levels (Kazooie has 837% coverage)", () => {
			const result = calculateLevelAndCoverage(837.2);

			expect(result.level).toBe(9);
			expect(result.displayCoverage).toBe(37.2);
			expect(result.effectiveCoverage).toBe(837.2);
		});

		it("floors level at 1 for negative coverage", () => {
			const result = calculateLevelAndCoverage(-5);

			expect(result.level).toBe(1);
			expect(result.displayCoverage).toBe(-5);
			expect(result.effectiveCoverage).toBe(-5);
		});

		it("rounds display coverage to 1 decimal place", () => {
			const result = calculateLevelAndCoverage(127.567);

			expect(result.displayCoverage).toBe(27.6);
			expect(result.effectiveCoverage).toBe(127.6);
		});
	});
});

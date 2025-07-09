import { describe, it, expect } from "vitest";
import { calculateXpThreshold, calculateMultipleChoiceXP } from "./xpSystem";

describe("XP Threshold System", () => {
	describe("calculateXpThreshold", () => {
		it("returns 5 XP for first poll", () => {
			expect(calculateXpThreshold(1)).toBe(5);
		});

		it("returns 7 XP for second poll", () => {
			expect(calculateXpThreshold(2)).toBe(7);
		});

		it("returns 9 XP for third poll", () => {
			expect(calculateXpThreshold(3)).toBe(9);
		});

		it("returns 11 XP for fourth poll", () => {
			expect(calculateXpThreshold(4)).toBe(11);
		});

		it("follows the pattern 5 + (n-1)*2", () => {
			expect(calculateXpThreshold(5)).toBe(13);
			expect(calculateXpThreshold(10)).toBe(23);
			expect(calculateXpThreshold(20)).toBe(43);
		});

		it("handles edge cases", () => {
			expect(calculateXpThreshold(0)).toBe(5);
			expect(calculateXpThreshold(-1)).toBe(5);
		});
	});

	describe("calculateMultipleChoiceXP", () => {
		it("calculates XP for perfect answers", () => {
			expect(calculateMultipleChoiceXP(2, 2, 0)).toBe(5);
			expect(calculateMultipleChoiceXP(1, 1, 0)).toBe(5);
		});

		it("calculates XP for partial answers", () => {
			expect(calculateMultipleChoiceXP(1, 2, 0)).toBe(2.5);
			expect(calculateMultipleChoiceXP(3, 4, 0)).toBe(3.75);
		});

		it("applies penalty for wrong answers", () => {
			expect(calculateMultipleChoiceXP(1, 2, 1)).toBe(0.5);
			expect(calculateMultipleChoiceXP(2, 2, 1)).toBe(3);
		});

		it("clamps negative XP to 0", () => {
			expect(calculateMultipleChoiceXP(0, 2, 3)).toBe(0);
			expect(calculateMultipleChoiceXP(1, 4, 3)).toBe(0);
		});

		it("handles zero total correctly", () => {
			expect(calculateMultipleChoiceXP(0, 0, 0)).toBe(0);
		});
	});
});
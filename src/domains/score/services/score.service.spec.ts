import { describe, it, expect } from "vitest";
import {
	outcomeSingle,
	outcomeMulti,
	singleCorrectnessFactor,
	multiCorrectnessFactor,
	calculateXP,
	orchestrateScoreCalculation,
} from "./score.service";

describe("score.service", () => {
	describe("outcomeSingle", () => {
		it("returns full for correct answer", () => {
			expect(outcomeSingle(true)).toBe("full");
		});

		it("returns wrong for incorrect answer", () => {
			expect(outcomeSingle(false)).toBe("wrong");
		});
	});

	describe("outcomeMulti", () => {
		it("returns full for all correct, no wrong", () => {
			expect(outcomeMulti(2, 2, 0)).toBe("full");
		});

		it("returns partial for some correct, some wrong", () => {
			expect(outcomeMulti(1, 2, 1)).toBe("partial");
		});

		it("returns partial for some correct, no wrong", () => {
			expect(outcomeMulti(1, 2, 0)).toBe("partial");
		});

		it("returns wrong for no correct answers", () => {
			expect(outcomeMulti(0, 2, 2)).toBe("wrong");
		});
	});

	describe("singleCorrectnessFactor", () => {
		it("returns 1.0 for correct answer", () => {
			expect(singleCorrectnessFactor(true)).toBe(1.0);
		});

		it("returns 0.0 for incorrect answer", () => {
			expect(singleCorrectnessFactor(false)).toBe(0.0);
		});
	});

	describe("multiCorrectnessFactor", () => {
		it("gives 1.5x bonus for perfect answer", () => {
			const result = multiCorrectnessFactor(3, 3, 0);
			expect(result).toBe(1.5);
		});

		it("gives 1.0 for complete but messy", () => {
			// All correct found, but with wrong picks
			const result = multiCorrectnessFactor(3, 3, 1);
			expect(result).toBe(1.0);
		});

		it("gives 1.0 for clean partial", () => {
			// Some correct, no wrong
			const result = multiCorrectnessFactor(2, 3, 0);
			expect(result).toBe(1.0);
		});

		it("gives 0.5 for messy partial", () => {
			// 2 correct out of 3, with 2 wrong = messy partial
			const result = multiCorrectnessFactor(2, 3, 2);
			expect(result).toBe(0.5); // Floor of 0.5 for messy partials
		});

		it("gives zero for no correct answers", () => {
			const result = multiCorrectnessFactor(0, 3, 3);
			expect(result).toBe(0.0);
		});

		it("triggers anti-spam for too many picks", () => {
			// Picking more than 2x correct answers
			const result = multiCorrectnessFactor(3, 3, 4);
			expect(result).toBe(0.0); // Anti-spam triggered
		});

		it("allows perfect score even with many options if all correct", () => {
			// Edge case: all options are correct and user picks all
			const result = multiCorrectnessFactor(5, 5, 0);
			expect(result).toBe(1.5); // Still perfect
		});
	});

	describe("calculateXP", () => {
		it("calculates XP based on correctness factor", () => {
			expect(calculateXP(1.0, 10)).toBe(10);
			expect(calculateXP(0.5, 10)).toBe(5);
			expect(calculateXP(0.0, 10)).toBe(0);
		});

		it("rounds XP to nearest integer", () => {
			expect(calculateXP(0.625, 10)).toBe(6); // 6.25 -> 6
			expect(calculateXP(0.75, 10)).toBe(8);   // 7.5 -> 8
		});
	});

	describe("orchestrateScoreCalculation", () => {
		it("multiplies base XP by correctness factor", () => {
			// Round 1, streak will be 2, base 10, amp 1.2 = 12 XP
			// With 1.5x perfect multiplier = 18 XP
			const result = orchestrateScoreCalculation(
				100, // current XP
				1,   // current streak
				1,   // best streak
				0,   // total polls answered (will become 1)
				1.5  // perfect correctness factor
			);
			
			expect(result.breakdown.base).toBe(10); // Round 1 base
			expect(result.breakdown.amp).toBe(1.2); // 2 streak = 1.2x
			expect(result.breakdown.earnedXP).toBe(18); // 10 * 1.2 * 1.5 = 18
			expect(result.newTotalXP).toBe(118); // 100 + 18
		});

		it("applies 0.5x factor for messy partial", () => {
			const result = orchestrateScoreCalculation(
				100, // current XP
				0,   // current streak
				0,   // best streak
				0,   // total polls answered
				0.5  // messy partial factor
			);
			
			expect(result.breakdown.base).toBe(10); // Round 1
			expect(result.breakdown.amp).toBe(1.1); // 1 streak
			expect(result.breakdown.earnedXP).toBe(6); // 10 * 1.1 * 0.5 = 5.5 → 6
			expect(result.newTotalXP).toBe(106);
		});

		it("gives 0 XP for wrong answer", () => {
			const result = orchestrateScoreCalculation(
				100, // current XP
				5,   // current streak (will reset)
				5,   // best streak
				10,  // total polls answered
				0    // wrong answer
			);
			
			expect(result.newStreak).toBe(0); // Streak reset
			expect(result.breakdown.earnedXP).toBe(0); // No XP earned
			expect(result.newTotalXP).toBe(100); // No change
		});
	});
});
import { describe, it, expect } from "vitest";
import {
	outcomeSingle,
	outcomeMulti,
	singleCorrectnessFactor,
	multiCorrectnessFactor,
	calculateXP,
	orchestrateScoreCalculation,
	calculatePollScoreForProgression,
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
			expect(calculateXP(0.75, 10)).toBe(8); // 7.5 -> 8
		});
	});

	describe("orchestrateScoreCalculation", () => {
		it("multiplies base XP by correctness factor", () => {
			// Round 1, streak will be 2, base 10, amp 1.2 = 12 XP
			// With 1.5x perfect multiplier = 18 XP
			const result = orchestrateScoreCalculation({
				currentXP: 100,
				currentStreak: 1,
				currentBestStreak: 1,
				totalPollsAnswered: 0,
				correctnessFactor: 1.5,
			});

			expect(result.breakdown.base).toBe(10); // Round 1 base
			expect(result.breakdown.amp).toBe(1.2); // 2 streak = 1.2x
			expect(result.breakdown.earnedXP).toBe(18); // 10 * 1.2 * 1.5 = 18
			expect(result.newTotalXP).toBe(118); // 100 + 18
		});

		it("applies 0.5x factor for messy partial", () => {
			const result = orchestrateScoreCalculation({
				currentXP: 100,
				currentStreak: 16,
				currentBestStreak: 0,
				totalPollsAnswered: 0,
				correctnessFactor: 0.5,
			});

			expect(result.breakdown.base).toBe(10); // Round 1 base
			expect(result.breakdown.amp).toBe(2.7); // 2 streak = 1.2x
			expect(result.breakdown.earnedXP).toBe(14); // 10 * 1.2 * 0.5 = 14
			expect(result.newTotalXP).toBe(114); // 100 + 14
		});

		it("applies 0.5x factor for messy partial", () => {
			const result = orchestrateScoreCalculation({
				currentXP: 100,
				currentStreak: 0,
				currentBestStreak: 0,
				totalPollsAnswered: 0,
				correctnessFactor: 0.5,
			});

			expect(result.breakdown.base).toBe(10); // Round 1
			expect(result.breakdown.amp).toBe(1.1); // 1 streak
			expect(result.breakdown.earnedXP).toBe(6); // 10 * 1.1 * 0.5 = 5.5 → 6
			expect(result.newTotalXP).toBe(106);
		});

		it("gives 0 XP for wrong answer", () => {
			const result = orchestrateScoreCalculation({
				currentXP: 100,
				currentStreak: 5,
				currentBestStreak: 5,
				totalPollsAnswered: 10,
				correctnessFactor: 0,
			});

			expect(result.newStreak).toBe(0); // Streak reset
			expect(result.breakdown.earnedXP).toBe(0); // No XP earned
			expect(result.newTotalXP).toBe(100); // No change
		});
	});

	describe("calculatePollScoreForProgression", () => {
		it("clamps negative amp to 0", () => {
			// Polls answered: 5, streak: 0, negative config bonus
			const result = calculatePollScoreForProgression(5, 0, -1.5);

			// Streak 0 gives 1.0 amp, -1.5 config bonus = -0.5
			// Should be clamped to 0
			expect(result.amp).toBe(0);
			expect(result.earnedXP).toBe(0); // 0 amp means 0 XP
		});

		it("allows positive amp even with negative config bonus", () => {
			// Polls answered: 5, streak: 5, negative config bonus
			const result = calculatePollScoreForProgression(5, 5, -0.3);

			// Streak 5 gives 1.5 amp, -0.3 config bonus = 1.2
			expect(result.amp).toBe(1.2);
			expect(result.base).toBe(20); // Round 2 base XP (5 polls = round 2)
			expect(result.earnedXP).toBe(24); // 20 * 1.2
		});

		it("works with positive config bonus", () => {
			// Polls answered: 5, streak: 2, positive config bonus
			const result = calculatePollScoreForProgression(5, 2, 0.5);

			// Streak 2 gives 1.2 amp, +0.5 config bonus = 1.7
			expect(result.amp).toBe(1.7);
			expect(result.base).toBe(20); // Round 2 base XP
			expect(result.earnedXP).toBe(34); // 20 * 1.7
		});
	});
});

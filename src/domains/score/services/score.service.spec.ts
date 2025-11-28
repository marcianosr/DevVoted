import { describe, it, expect } from "vitest";

import {
	outcomeSingle,
	outcomeMulti,
	singleCorrectnessFactor,
	multiCorrectnessFactor,
	calculateCoverage,
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

	describe("calculateCoverage", () => {
		it("calculates coverage with round scaling (round 1)", () => {
			// Round 1: base = 1.2%, streak 0
			expect(
				calculateCoverage({ correctnessFactor: 1.0, round: 1, streak: 0 })
			).toBe(1.2);
			expect(
				calculateCoverage({ correctnessFactor: 0.5, round: 1, streak: 0 })
			).toBe(0.6); // 1.2 × 0.5
			expect(
				calculateCoverage({ correctnessFactor: 0.0, round: 1, streak: 0 })
			).toBe(-0.5); // Wrong = -0.5%
		});

		it("calculates coverage with round scaling (round 5)", () => {
			// Round 5: base = 2%, streak 0
			expect(
				calculateCoverage({ correctnessFactor: 1.0, round: 5, streak: 0 })
			).toBe(2);
			expect(
				calculateCoverage({ correctnessFactor: 1.5, round: 5, streak: 0 })
			).toBe(3); // 2 × 1.5
		});

		it("applies streak bonus", () => {
			// Round 1: base = 1.2%, streak 5 = 0.5%, total = 1.7%
			expect(
				calculateCoverage({ correctnessFactor: 1.0, round: 1, streak: 5 })
			).toBe(1.7);
		});

		it("caps streak bonus at 1%", () => {
			// Round 1: base = 1.2%, streak 20 = 1% (capped), total = 2.2%
			expect(
				calculateCoverage({ correctnessFactor: 1.0, round: 1, streak: 20 })
			).toBe(2.2);
		});

		it("handles perfect multi-choice with scaling", () => {
			// Round 5: base = 2%, streak 5 = 0.5%, total = 2.5%
			// Perfect multi (1.5x): 2.5 × 1.5 = 3.75
			expect(
				calculateCoverage({ correctnessFactor: 1.5, round: 5, streak: 5 })
			).toBe(3.75);
		});
	});

	describe("orchestrateScoreCalculation", () => {
		it("calculates coverage for round 1 perfect answer", () => {
			const result = orchestrateScoreCalculation({
				currentCoverage: 10,
				currentStreak: 0,
				currentBestStreak: 0,
				totalPollsAnswered: 0,
				totalPollsSeen: 0, // Round 1
				correctnessFactor: 1.0,
			});

			// Round 1: base 1.2%, new streak 1 = 0.1%, total 1.3%
			expect(result.breakdown.earnedCoverage).toBe(1.3);
			expect(result.newTotalCoverage).toBe(11.3); // 10 + 1.3
			expect(result.newStreak).toBe(1); // Streak incremented
		});

		it("calculates coverage for round 5 with streak bonus", () => {
			const result = orchestrateScoreCalculation({
				currentCoverage: 20,
				currentStreak: 4,
				currentBestStreak: 5,
				totalPollsAnswered: 20,
				totalPollsSeen: 20, // Round 5 (4*5 + 0)
				correctnessFactor: 1.0,
			});

			// Round 5: base 2%, new streak 5 = 0.5%, total 2.5%
			expect(result.breakdown.earnedCoverage).toBe(2.5);
			expect(result.newStreak).toBe(5);
		});

		it("handles perfect multi-choice with scaling", () => {
			const result = orchestrateScoreCalculation({
				currentCoverage: 15,
				currentStreak: 4,
				currentBestStreak: 5,
				totalPollsAnswered: 20,
				totalPollsSeen: 20, // Round 5 (4*5 + 0)
				correctnessFactor: 1.5, // Perfect multi-choice
			});

			// Round 5: base 2%, new streak 5 = 0.5%, total 2.5%
			// Perfect multi (1.5x): 2.5 × 1.5 = 3.75, rounded to 3.8
			expect(result.breakdown.earnedCoverage).toBe(3.8);
			expect(result.newTotalCoverage).toBe(18.8); // 15 + 3.8
			expect(result.newStreak).toBe(5);
		});

		it("applies penalty for wrong answer", () => {
			const result = orchestrateScoreCalculation({
				currentCoverage: 20,
				currentStreak: 5,
				currentBestStreak: 5,
				totalPollsAnswered: 10,
				totalPollsSeen: 10,
				correctnessFactor: 0,
			});

			expect(result.newStreak).toBe(0); // Streak reset
			expect(result.breakdown.earnedCoverage).toBe(-0.5); // Wrong answer penalty
			expect(result.newTotalCoverage).toBe(19.5); // 20 + (-0.5) = 19.5
		});

		it("applies config coverage bonus on top of scaling", () => {
			const result = orchestrateScoreCalculation({
				currentCoverage: 10,
				currentStreak: 4,
				currentBestStreak: 5,
				totalPollsAnswered: 20,
				totalPollsSeen: 20, // Round 5 (4*5 + 0)
				correctnessFactor: 1.0,
				coverageAdd: 0.5, // +0.5% from .js config
			});

			// Round 5: base 2%, new streak 5 = 0.5%, total 2.5%
			// + config 0.5% = 3%, rounds to 3%
			expect(result.breakdown.earnedCoverage).toBe(3);
			expect(result.newTotalCoverage).toBe(13); // 10 + 3
		});

		it("works with high rounds and streaks", () => {
			const result = orchestrateScoreCalculation({
				currentCoverage: 50,
				currentStreak: 9,
				currentBestStreak: 10,
				totalPollsAnswered: 45,
				totalPollsSeen: 45, // Round 10 (9*5 + 0)
				correctnessFactor: 1.0,
			});

			// Round 10: base 3%, new streak 10 = 1% (capped), total 4%
			expect(result.breakdown.earnedCoverage).toBe(4);
			expect(result.newTotalCoverage).toBe(54); // 50 + 4
			expect(result.newStreak).toBe(10);
		});

		it("caps total coverage at 100%", () => {
			const result = orchestrateScoreCalculation({
				currentCoverage: 98,
				currentStreak: 9,
				currentBestStreak: 10,
				totalPollsAnswered: 45,
				totalPollsSeen: 45, // Round 10 (9*5 + 0)
				correctnessFactor: 1.0,
			});

			// Round 10: base 3%, new streak 10 = 1%, total 4%
			// But 98 + 4 = 102, should be capped at 100
			expect(result.breakdown.earnedCoverage).toBe(4);
			expect(result.newTotalCoverage).toBe(100); // Capped at 100
			expect(result.newStreak).toBe(10);
		});
	});

	describe("calculatePollScoreForProgression", () => {
		it("returns base coverage breakdown with round scaling", () => {
			// Round 1: base = 1.2%, streak 5 = 0.5%, total = 1.7%
			const result = calculatePollScoreForProgression(1, 5);

			expect(result.streak).toBe(5);
			expect(result.earnedCoverage).toBe(1.7); // 1.2 + 0.5
			expect(result.delta).toBe(1.7);
		});

		it("works with zero streak", () => {
			// Round 1: base = 1.2%, streak 0 = 0%, total = 1.2%
			const result = calculatePollScoreForProgression(1, 0);

			expect(result.streak).toBe(0);
			expect(result.earnedCoverage).toBe(1.2);
			expect(result.delta).toBe(1.2);
		});

		it("calculates for higher rounds", () => {
			// Round 5: base = 2%, streak 3 = 0.3%, total = 2.3%
			const result = calculatePollScoreForProgression(5, 3);

			expect(result.streak).toBe(3);
			expect(result.earnedCoverage).toBe(2.3);
			expect(result.delta).toBe(2.3);
		});
	});
});

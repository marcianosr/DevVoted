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
		it("calculates coverage based on correctness factor", () => {
			expect(calculateCoverage(1.0)).toBe(1); // Full correct = 1%
			expect(calculateCoverage(0.5)).toBe(1); // Partial rounds to 1%
			expect(calculateCoverage(0.0)).toBe(0); // Wrong = 0%
		});

		it("handles perfect multi-choice bonus", () => {
			expect(calculateCoverage(1.5)).toBe(2); // Perfect multi = 1.5% rounds to 2%
		});
	});

	describe("orchestrateScoreCalculation", () => {
		it("calculates coverage for perfect multi-choice answer", () => {
			const result = orchestrateScoreCalculation({
				currentCoverage: 10,
				currentStreak: 1,
				currentBestStreak: 1,
				totalPollsAnswered: 0,
				correctnessFactor: 1.5, // Perfect multi-choice
			});

			expect(result.breakdown.earnedCoverage).toBe(2); // 1% * 1.5 rounds to 2%
			expect(result.newTotalCoverage).toBe(12); // 10 + 2
			expect(result.newStreak).toBe(2); // Streak incremented
		});

		it("applies 0.5x factor for messy partial", () => {
			const result = orchestrateScoreCalculation({
				currentCoverage: 10,
				currentStreak: 5,
				currentBestStreak: 5,
				totalPollsAnswered: 3,
				correctnessFactor: 0.5,
			});

			expect(result.breakdown.earnedCoverage).toBe(1); // 1% * 0.5 rounds to 1%
			expect(result.newTotalCoverage).toBe(11); // 10 + 1
			expect(result.newStreak).toBe(6); // Streak incremented
		});

		it("gives 0 coverage for wrong answer", () => {
			const result = orchestrateScoreCalculation({
				currentCoverage: 10,
				currentStreak: 5,
				currentBestStreak: 5,
				totalPollsAnswered: 10,
				correctnessFactor: 0,
			});

			expect(result.newStreak).toBe(0); // Streak reset
			expect(result.breakdown.earnedCoverage).toBe(0); // No coverage earned
			expect(result.newTotalCoverage).toBe(10); // No change
		});

		it("applies config coverage bonus", () => {
			const result = orchestrateScoreCalculation({
				currentCoverage: 10,
				currentStreak: 2,
				currentBestStreak: 5,
				totalPollsAnswered: 3,
				correctnessFactor: 1.0,
				coverageAdd: 0.5, // +0.5% from .js config
			});

			expect(result.breakdown.earnedCoverage).toBe(2); // 1% + 0.5% config rounds to 2%
			expect(result.newTotalCoverage).toBe(12); // 10 + 2
		});
	});

	describe("calculatePollScoreForProgression", () => {
		it("returns base coverage breakdown with streak", () => {
			const result = calculatePollScoreForProgression(5);

			expect(result.streak).toBe(5);
			expect(result.earnedCoverage).toBe(1); // Always 1% base
			expect(result.delta).toBe(1);
		});

		it("works with zero streak", () => {
			const result = calculatePollScoreForProgression(0);

			expect(result.streak).toBe(0);
			expect(result.earnedCoverage).toBe(1); // Always 1% base
			expect(result.delta).toBe(1);
		});
	});
});

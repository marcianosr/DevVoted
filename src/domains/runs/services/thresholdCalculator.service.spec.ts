import { describe, it, expect } from "vitest";
import { calculateThresholdInfo } from "./thresholdCalculator.service";
import { createMockRunCategoryXp } from "~/domains/runs/models/runCategoryXp";

describe("ThresholdCalculator", () => {
	describe("calculateThresholdInfo", () => {
		it("calculates threshold for poll 1 correctly (Round 1, Poll 1)", () => {
			const categoryData = [
				createMockRunCategoryXp({
					currentCoverage: 5,
					pollsAnswered: 1,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll
				maxCoverage: 5,
				requiredCoverage: 10, // Round 1 threshold
				pollNumber: 1,
				currentRound: 1,
				pollInRound: 1,
				isThresholdCheckPoll: false,
			});
		});

		it("calculates threshold for poll 2 correctly (Round 1, Poll 2)", () => {
			const categoryData = [
				createMockRunCategoryXp({
					currentCoverage: 6,
					pollsAnswered: 2,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll
				maxCoverage: 6,
				requiredCoverage: 10, // Round 1 threshold
				pollNumber: 2,
				currentRound: 1,
				pollInRound: 2,
				isThresholdCheckPoll: false,
			});
		});

		it("calculates threshold for poll 3 correctly (Round 1, Poll 3 - THRESHOLD CHECK)", () => {
			const categoryData = [
				createMockRunCategoryXp({
					currentCoverage: 8,
					pollsAnswered: 3,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: false, // 8 < 10, threshold check fails
				maxCoverage: 8,
				requiredCoverage: 10, // Round 1 threshold
				pollNumber: 3,
				currentRound: 1,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});

		it("calculates threshold for poll 3 with sufficient coverage (Round 1, Poll 3 - PASSES)", () => {
			const categoryData = [
				createMockRunCategoryXp({
					currentCoverage: 12,
					pollsAnswered: 3,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: true, // 12 >= 10, threshold check passes
				maxCoverage: 12,
				requiredCoverage: 10, // Round 1 threshold
				pollNumber: 3,
				currentRound: 1,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});

		it("calculates threshold for poll 4 correctly (Round 2, Poll 1)", () => {
			const categoryData = [
				createMockRunCategoryXp({
					currentCoverage: 16,
					pollsAnswered: 4,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll
				maxCoverage: 16,
				requiredCoverage: 20, // Round 2 threshold
				pollNumber: 4,
				currentRound: 2,
				pollInRound: 1,
				isThresholdCheckPoll: false,
			});
		});

		it("handles zero polls answered (game start)", () => {
			const categoryData = [
				createMockRunCategoryXp({
					currentCoverage: 0,
					pollsAnswered: 0,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll (poll 0)
				maxCoverage: 0,
				requiredCoverage: 10, // Round 1 - game starts at Round 1
				pollNumber: 0,
				currentRound: 1,
				pollInRound: 3, // 0 % 3 = 0, but we show as poll 3 position
				isThresholdCheckPoll: false,
			});
		});

		it("handles poll 6 threshold check (Round 2, Poll 3)", () => {
			const categoryData = [
				createMockRunCategoryXp({
					currentCoverage: 22,
					pollsAnswered: 6,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: true, // 22 >= 20, threshold check passes
				maxCoverage: 22,
				requiredCoverage: 20, // Round 2 threshold
				pollNumber: 6,
				currentRound: 2,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});

		it("handles poll 9 threshold check (Round 3, Poll 3)", () => {
			const categoryData = [
				createMockRunCategoryXp({
					currentCoverage: 28,
					pollsAnswered: 9,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: false, // 28 < 30, threshold check fails
				maxCoverage: 28,
				requiredCoverage: 30, // Round 3 threshold
				pollNumber: 9,
				currentRound: 3,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});
	});

	describe("multi-category scenarios", () => {
		it("calculates max coverage across multiple categories", () => {
			const categoryData = [
				createMockRunCategoryXp({
					categoryCode: "react",
					currentCoverage: 5,
					pollsAnswered: 1,
				}),
				createMockRunCategoryXp({
					categoryCode: "js",
					currentCoverage: 8,
					pollsAnswered: 1,
				}),
				createMockRunCategoryXp({
					categoryCode: "css",
					currentCoverage: 3,
					pollsAnswered: 1,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			// Total: 3 polls answered, max coverage is 8%
			// Round 1, Poll 3 - THRESHOLD CHECK
			expect(result).toEqual({
				meetsThreshold: false, // 8 < 10, threshold check fails
				maxCoverage: 8,
				requiredCoverage: 10,
				pollNumber: 3,
				currentRound: 1,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});

		it("passes threshold when any category meets requirement", () => {
			const categoryData = [
				createMockRunCategoryXp({
					categoryCode: "react",
					currentCoverage: 15,
					pollsAnswered: 2,
				}),
				createMockRunCategoryXp({
					categoryCode: "js",
					currentCoverage: 3,
					pollsAnswered: 1,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			// Total: 3 polls answered, max coverage is 15%
			// Round 1, Poll 3 - THRESHOLD CHECK
			expect(result).toEqual({
				meetsThreshold: true, // 15 >= 10, threshold check passes
				maxCoverage: 15,
				requiredCoverage: 10,
				pollNumber: 3,
				currentRound: 1,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});

		it("handles progression to Round 2 with multi-category data", () => {
			const categoryData = [
				createMockRunCategoryXp({
					categoryCode: "react",
					currentCoverage: 18,
					pollsAnswered: 2,
				}),
				createMockRunCategoryXp({
					categoryCode: "js",
					currentCoverage: 15,
					pollsAnswered: 2,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			// Total: 4 polls answered, max coverage is 18%
			// Round 2, Poll 1 - Not a threshold check
			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll
				maxCoverage: 18,
				requiredCoverage: 20, // Round 2 threshold
				pollNumber: 4,
				currentRound: 2,
				pollInRound: 1,
				isThresholdCheckPoll: false,
			});
		});

		it("handles threshold failure on poll 6 (Round 2, Poll 3)", () => {
			const categoryData = [
				createMockRunCategoryXp({
					categoryCode: "react",
					currentCoverage: 12,
					pollsAnswered: 3,
				}),
				createMockRunCategoryXp({
					categoryCode: "js",
					currentCoverage: 10,
					pollsAnswered: 2,
				}),
				createMockRunCategoryXp({
					categoryCode: "css",
					currentCoverage: 8,
					pollsAnswered: 1,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			// Total: 6 polls answered, max coverage is 12%
			// Round 2, Poll 3 - THRESHOLD CHECK
			expect(result).toEqual({
				meetsThreshold: false, // 12 < 20, threshold check fails
				maxCoverage: 12,
				requiredCoverage: 20, // Round 2 threshold
				pollNumber: 6,
				currentRound: 2,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});
	});

	describe("real-world scenarios", () => {
		it("handles user earning minimal coverage on first poll", () => {
			// User answered 1 poll in React category, earned 5% coverage
			const categoryData = [
				createMockRunCategoryXp({
					categoryCode: "react",
					currentCoverage: 5,
					pollsAnswered: 1,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll, so always passes
				maxCoverage: 5,
				requiredCoverage: 10, // Round 1 threshold
				pollNumber: 1,
				currentRound: 1,
				pollInRound: 1,
				isThresholdCheckPoll: false,
			});
		});

		it("handles multi-category progression with varying coverage", () => {
			// React: 2 polls (12% coverage), JavaScript: 2 polls (8% coverage)
			// Total: 4 polls answered, checking poll 4 (Round 2, Poll 1)
			const categoryData = [
				createMockRunCategoryXp({
					categoryCode: "react",
					currentCoverage: 12,
					pollsAnswered: 2,
				}),
				createMockRunCategoryXp({
					categoryCode: "js",
					currentCoverage: 8,
					pollsAnswered: 2,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll
				maxCoverage: 12,
				requiredCoverage: 20, // Round 2 threshold
				pollNumber: 4,
				currentRound: 2,
				pollInRound: 1,
				isThresholdCheckPoll: false,
			});
		});

		it("handles threshold failure on poll 3 with low coverage", () => {
			// User has only 7% coverage after 3 polls, needs 10% for Round 1
			const categoryData = [
				createMockRunCategoryXp({
					currentCoverage: 7,
					pollsAnswered: 3,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: false, // 7 < 10, threshold check fails
				maxCoverage: 7,
				requiredCoverage: 10, // Round 1 threshold
				pollNumber: 3,
				currentRound: 1,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});

		it("handles perfect 10% coverage on Round 1 checkpoint", () => {
			// User has exactly 10% coverage on poll 3
			const categoryData = [
				createMockRunCategoryXp({
					currentCoverage: 10,
					pollsAnswered: 3,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: true, // 10 >= 10, threshold check passes
				maxCoverage: 10,
				requiredCoverage: 10,
				pollNumber: 3,
				currentRound: 1,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});

		it("handles high achiever with 30% coverage in Round 1", () => {
			// User has 30% coverage after 3 polls in one category
			const categoryData = [
				createMockRunCategoryXp({
					categoryCode: "react",
					currentCoverage: 30,
					pollsAnswered: 3,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result).toEqual({
				meetsThreshold: true, // 30 >= 10, threshold check passes easily
				maxCoverage: 30,
				requiredCoverage: 10,
				pollNumber: 3,
				currentRound: 1,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});
	});
});

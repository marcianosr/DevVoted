import { describe, it, expect } from "vitest";
import {
	calculateThresholdInfo,
	calculateNextPollThresholdFromCategoryData,
} from "./thresholdCalculator.service";
import { aggregateRunCategoryXp } from "~/domains/runs/utils/xpCalculations";
import { createMockRunCategoryXp } from "~/domains/runs/models/runCategoryXp";

describe("ThresholdCalculator", () => {
	describe("calculateThresholdInfo", () => {
		it("calculates threshold for poll 1 correctly (Set 1, Poll 1)", () => {
			const result = calculateThresholdInfo(5, 1);

			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll
				currentXp: 5,
				requiredXp: 15, // Set 1 threshold
				pollNumber: 1,
				currentRound: 1,
				pollInRound: 1,
				isThresholdCheckPoll: false,
			});
		});

		it("calculates threshold for poll 2 correctly (Set 1, Poll 2)", () => {
			const result = calculateThresholdInfo(6, 2);

			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll
				currentXp: 6,
				requiredXp: 15, // Set 1 threshold
				pollNumber: 2,
				currentRound: 1,
				pollInRound: 2,
				isThresholdCheckPoll: false,
			});
		});

		it("calculates threshold for poll 3 correctly (Set 1, Poll 3 - THRESHOLD CHECK)", () => {
			const result = calculateThresholdInfo(11, 3);

			expect(result).toEqual({
				meetsThreshold: false, // 11 < 15, threshold check fails
				currentXp: 11,
				requiredXp: 15, // Set 1 threshold
				pollNumber: 3,
				currentRound: 1,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});

		it("calculates threshold for poll 4 correctly (Set 2, Poll 1)", () => {
			const result = calculateThresholdInfo(16, 4);

			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll
				currentXp: 16,
				requiredXp: 21, // Set 2 threshold
				pollNumber: 4,
				currentRound: 2,
				pollInRound: 1,
				isThresholdCheckPoll: false,
			});
		});

		it("handles zero polls answered", () => {
			const result = calculateThresholdInfo(0, 0);

			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll (poll 0)
				currentXp: 0,
				requiredXp: 15, // Set 1 threshold (or 0 for no set)
				pollNumber: 0,
				currentRound: 0,
				pollInRound: 3, // 0 % 3 = 0, but we show as poll 3 position
				isThresholdCheckPoll: false,
			});
		});

		it("handles poll 6 threshold check (Set 2, Poll 3)", () => {
			const result = calculateThresholdInfo(25, 6);

			expect(result).toEqual({
				meetsThreshold: true, // 25 >= 21, threshold check passes
				currentXp: 25,
				requiredXp: 21, // Set 2 threshold
				pollNumber: 6,
				currentRound: 2,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});
	});

	describe("aggregateRunCategoryXp", () => {
		it("aggregates XP and polls across multiple categories", () => {
			const categoryData = [
				createMockRunCategoryXp({ currentXp: 3, pollsAnswered: 1 }),
				createMockRunCategoryXp({ currentXp: 2, pollsAnswered: 1 }),
				createMockRunCategoryXp({ currentXp: 0, pollsAnswered: 0 }),
			];

			const result = aggregateRunCategoryXp(categoryData);

			expect(result).toEqual({
				totalXp: 5,
				totalPollsAnswered: 2,
			});
		});

		it("handles empty category data", () => {
			const categoryData = [];

			const result = aggregateRunCategoryXp(categoryData);

			expect(result).toEqual({
				totalXp: 0,
				totalPollsAnswered: 0,
			});
		});
	});

	describe("calculateNextPollThresholdFromCategoryData", () => {
		it("calculates next poll threshold from multi-category data (Set 2, Poll 1)", () => {
			const categoryData = [
				createMockRunCategoryXp({ currentXp: 2, pollsAnswered: 1 }), // react
				createMockRunCategoryXp({ currentXp: 3, pollsAnswered: 1 }), // javascript
				createMockRunCategoryXp({ currentXp: 5, pollsAnswered: 1 }), // css
			];

			const result =
				calculateNextPollThresholdFromCategoryData(categoryData);

			// Total: 10 XP, 3 polls answered, next poll is #4 (Set 2, Poll 1)
			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll
				currentXp: 10,
				requiredXp: 21, // Set 2 threshold
				pollNumber: 4,
				currentRound: 2,
				pollInRound: 1,
				isThresholdCheckPoll: false,
			});
		});

		it("handles progression to threshold check poll (Set 2, Poll 3)", () => {
			const categoryData = [
				createMockRunCategoryXp({ currentXp: 5, pollsAnswered: 1 }),
				createMockRunCategoryXp({ currentXp: 5, pollsAnswered: 1 }),
				createMockRunCategoryXp({ currentXp: 5, pollsAnswered: 1 }),
				createMockRunCategoryXp({ currentXp: 5, pollsAnswered: 1 }),
				createMockRunCategoryXp({ currentXp: 5, pollsAnswered: 1 }),
			];

			const result =
				calculateNextPollThresholdFromCategoryData(categoryData);

			// Total: 25 XP, 5 polls answered, next poll is #6 (Set 2, Poll 3 - THRESHOLD CHECK)
			expect(result).toEqual({
				meetsThreshold: true, // 25 >= 21, threshold check would pass
				currentXp: 25,
				requiredXp: 21, // Set 2 threshold
				pollNumber: 6,
				currentRound: 2,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});
	});

	describe("real-world scenarios", () => {
		it("handles user earning 2 XP on first poll (Set 1, Poll 1)", () => {
			// User answered 1 poll, earned 2 XP (rounded from 1.67)
			const result = calculateThresholdInfo(2, 1);

			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll, so always passes
				currentXp: 2,
				requiredXp: 15, // Set 1 threshold
				pollNumber: 1,
				currentRound: 1,
				pollInRound: 1,
				isThresholdCheckPoll: false,
			});
		});

		it("handles multi-category progression (Set 2, Poll 1)", () => {
			// React: 2 polls (10 XP), JavaScript: 2 polls (10 XP)
			// Total: 20 XP, 4 polls answered, checking poll 4 (Set 2, Poll 1)
			const result = calculateThresholdInfo(20, 4);

			expect(result).toEqual({
				meetsThreshold: true, // Not a threshold check poll
				currentXp: 20,
				requiredXp: 21, // Set 2 threshold
				pollNumber: 4,
				currentRound: 2,
				pollInRound: 1,
				isThresholdCheckPoll: false,
			});
		});

		it("handles threshold failure on poll 3 (Set 1, Poll 3)", () => {
			// User has only 10 XP after 3 polls, needs 15 XP for Set 1
			const result = calculateThresholdInfo(10, 3);

			expect(result).toEqual({
				meetsThreshold: false, // 10 < 15, threshold check fails
				currentXp: 10,
				requiredXp: 15, // Set 1 threshold
				pollNumber: 3,
				currentRound: 1,
				pollInRound: 3,
				isThresholdCheckPoll: true,
			});
		});
	});
});

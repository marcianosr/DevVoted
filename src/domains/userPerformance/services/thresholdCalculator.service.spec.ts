import { describe, it, expect } from "vitest";
import {
	calculateThresholdInfo,
	calculateNextPollThresholdFromCategoryData,
	aggregateCategoryXpData,
	type CategoryXpData,
} from "./thresholdCalculator.service";

describe("ThresholdCalculator", () => {
	describe("calculateThresholdInfo", () => {
		it("calculates threshold for poll 1 correctly", () => {
			const result = calculateThresholdInfo(5, 1);

			expect(result).toEqual({
				meetsThreshold: true,
				currentXp: 5,
				requiredXp: 5,
				pollNumber: 1,
			});
		});

		it("calculates threshold for poll 2 correctly", () => {
			const result = calculateThresholdInfo(6, 2);

			expect(result).toEqual({
				meetsThreshold: false,
				currentXp: 6,
				requiredXp: 7,
				pollNumber: 2,
			});
		});

		it("calculates threshold for poll 4 correctly", () => {
			const result = calculateThresholdInfo(11, 4);

			expect(result).toEqual({
				meetsThreshold: true,
				currentXp: 11,
				requiredXp: 11,
				pollNumber: 4,
			});
		});

		it("handles zero polls answered", () => {
			const result = calculateThresholdInfo(0, 0);

			expect(result).toEqual({
				meetsThreshold: false, // 0 < 5 (poll 0 threshold)
				currentXp: 0,
				requiredXp: 5,
				pollNumber: 0,
			});
		});

		it("handles insufficient XP", () => {
			const result = calculateThresholdInfo(3, 1);

			expect(result).toEqual({
				meetsThreshold: false,
				currentXp: 3,
				requiredXp: 5,
				pollNumber: 1,
			});
		});
	});

	describe("aggregateCategoryXpData", () => {
		it("aggregates XP and polls across multiple categories", () => {
			const categoryData: CategoryXpData[] = [
				{ currentXp: 3, pollsAnswered: 1 },
				{ currentXp: 2, pollsAnswered: 1 },
				{ currentXp: 0, pollsAnswered: 0 },
			];

			const result = aggregateCategoryXpData(categoryData);

			expect(result).toEqual({
				totalXp: 5,
				totalPollsAnswered: 2,
			});
		});

		it("handles empty category data", () => {
			const categoryData: CategoryXpData[] = [];

			const result = aggregateCategoryXpData(categoryData);

			expect(result).toEqual({
				totalXp: 0,
				totalPollsAnswered: 0,
			});
		});
	});

	describe("calculateNextPollThresholdFromCategoryData", () => {
		it("calculates next poll threshold from multi-category data", () => {
			const categoryData: CategoryXpData[] = [
				{ currentXp: 2, pollsAnswered: 1 }, // react
				{ currentXp: 3, pollsAnswered: 1 }, // javascript
				{ currentXp: 5, pollsAnswered: 1 }, // css
			];

			const result =
				calculateNextPollThresholdFromCategoryData(categoryData);

			// Total: 10 XP, 3 polls answered, next poll is #4
			expect(result).toEqual({
				meetsThreshold: false, // 10 < 11 (poll 4 threshold)
				currentXp: 10,
				requiredXp: 11,
				pollNumber: 4,
			});
		});

		it("handles progression from basic to advanced polls", () => {
			const categoryData: CategoryXpData[] = [
				{ currentXp: 5, pollsAnswered: 1 },
				{ currentXp: 5, pollsAnswered: 1 },
				{ currentXp: 5, pollsAnswered: 1 },
				{ currentXp: 5, pollsAnswered: 1 },
				{ currentXp: 5, pollsAnswered: 1 },
			];

			const result =
				calculateNextPollThresholdFromCategoryData(categoryData);

			// Total: 25 XP, 5 polls answered, next poll is #6
			expect(result).toEqual({
				meetsThreshold: true, // 25 >= 15 (poll 6 threshold: 5 + (6-1)*2 = 15)
				currentXp: 25,
				requiredXp: 15,
				pollNumber: 6,
			});
		});
	});

	describe("real-world scenarios", () => {
		it("handles user earning 2 XP on first poll", () => {
			// User answered 1 poll, earned 2 XP (rounded from 1.67)
			const result = calculateThresholdInfo(2, 1);

			expect(result).toEqual({
				meetsThreshold: false, // 2 < 5, run should reset
				currentXp: 2,
				requiredXp: 5,
				pollNumber: 1,
			});
		});

		it("handles multi-category progression", () => {
			// React: 2 polls (10 XP), JavaScript: 2 polls (10 XP)
			// Total: 20 XP, 4 polls answered, checking poll 4 threshold
			const result = calculateThresholdInfo(20, 4);

			expect(result).toEqual({
				meetsThreshold: true, // 20 >= 11 (poll 4 threshold)
				currentXp: 20,
				requiredXp: 11,
				pollNumber: 4,
			});
		});
	});
});

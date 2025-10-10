import { describe, it, expect } from "vitest";
import { aggregateRunCategoryXp } from "./xpCalculations";
import { createMockRunCategoryXp } from "~/domains/runs/models/runCategoryXp";

describe("aggregateRunCategoryXp", () => {
	it("returns zero totals for empty array", () => {
		const result = aggregateRunCategoryXp([]);

		expect(result).toEqual({
			totalXp: 0,
			totalPollsAnswered: 0,
		});
	});

	it("aggregates XP and polls for single category", () => {
		const categoryXp = [
			createMockRunCategoryXp({
				categoryCode: "js",
				currentXp: 50,
				pollsAnswered: 5,
			}),
		];

		const result = aggregateRunCategoryXp(categoryXp);

		expect(result).toEqual({
			totalXp: 50,
			totalPollsAnswered: 5,
		});
	});

	it("aggregates XP and polls for multiple categories", () => {
		const categoryXp = [
			createMockRunCategoryXp({
				categoryCode: "js",
				currentXp: 30,
				pollsAnswered: 3,
			}),
			createMockRunCategoryXp({
				categoryCode: "ts",
				currentXp: 50,
				pollsAnswered: 5,
			}),
			createMockRunCategoryXp({
				categoryCode: "react",
				currentXp: 20,
				pollsAnswered: 2,
			}),
		];

		const result = aggregateRunCategoryXp(categoryXp);

		expect(result).toEqual({
			totalXp: 100,
			totalPollsAnswered: 10,
		});
	});

	it("handles categories with zero XP and polls", () => {
		const categoryXp = [
			createMockRunCategoryXp({
				categoryCode: "js",
				currentXp: 0,
				pollsAnswered: 0,
			}),
			createMockRunCategoryXp({
				categoryCode: "ts",
				currentXp: 30,
				pollsAnswered: 3,
			}),
		];

		const result = aggregateRunCategoryXp(categoryXp);

		expect(result).toEqual({
			totalXp: 30,
			totalPollsAnswered: 3,
		});
	});
});

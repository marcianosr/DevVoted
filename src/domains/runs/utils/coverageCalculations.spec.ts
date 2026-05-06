import { describe, it, expect } from "vitest";

import { createMockRunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage.mock";

import { aggregateRunCategoryCoverage } from "./coverageCalculations";

describe("aggregateRunCategoryCoverage", () => {
	it("returns zero totals for empty array", () => {
		const result = aggregateRunCategoryCoverage([]);

		expect(result).toEqual({
			totalCoverage: 0,
			totalPollsAnswered: 0,
		});
	});

	it("aggregates coverage and polls for single category", () => {
		const categoryCoverage = [
			createMockRunCategoryCoverage({
				categoryCode: "js",
				currentCoverage: 50,
				pollsAnswered: 5,
			}),
		];

		const result = aggregateRunCategoryCoverage(categoryCoverage);

		expect(result).toEqual({
			totalCoverage: 50,
			totalPollsAnswered: 5,
		});
	});

	it("aggregates coverage and polls for multiple categories", () => {
		const categoryCoverage = [
			createMockRunCategoryCoverage({
				categoryCode: "js",
				currentCoverage: 30,
				pollsAnswered: 3,
			}),
			createMockRunCategoryCoverage({
				categoryCode: "ts",
				currentCoverage: 50,
				pollsAnswered: 5,
			}),
			createMockRunCategoryCoverage({
				categoryCode: "react",
				currentCoverage: 20,
				pollsAnswered: 2,
			}),
		];

		const result = aggregateRunCategoryCoverage(categoryCoverage);

		expect(result).toEqual({
			totalCoverage: 100,
			totalPollsAnswered: 10,
		});
	});

	it("handles categories with zero coverage and polls", () => {
		const categoryCoverage = [
			createMockRunCategoryCoverage({
				categoryCode: "js",
				currentCoverage: 0,
				pollsAnswered: 0,
			}),
			createMockRunCategoryCoverage({
				categoryCode: "ts",
				currentCoverage: 30,
				pollsAnswered: 3,
			}),
		];

		const result = aggregateRunCategoryCoverage(categoryCoverage);

		expect(result).toEqual({
			totalCoverage: 30,
			totalPollsAnswered: 3,
		});
	});
});

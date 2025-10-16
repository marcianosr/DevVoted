import { describe, it, expect } from "vitest";
import {
	calculateThresholdInfo,
	getGateDefinition,
} from "./thresholdCalculator.service";
import { createMockRunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";

describe("ThresholdCalculator", () => {
	describe("Gate Definitions", () => {
		it("has correct gate 1 definition (10% in 1 category)", () => {
			const gate = getGateDefinition(1);

			expect(gate).toEqual({
				gate: 1,
				requirements: [{ threshold: 10, requiredCategories: 1 }],
				evaluationMode: "OR",
			});
		});

		it("has correct gate 2 definition (15% in 1 OR 10% in 2)", () => {
			const gate = getGateDefinition(2);

			expect(gate).toEqual({
				gate: 2,
				requirements: [
					{ threshold: 15, requiredCategories: 1 },
					{ threshold: 10, requiredCategories: 2 },
				],
				evaluationMode: "OR",
			});
		});

		it("has correct gate 5 definition (30% in 1 AND 15% in another)", () => {
			const gate = getGateDefinition(5);

			expect(gate).toEqual({
				gate: 5,
				requirements: [
					{ threshold: 30, requiredCategories: 1 },
					{ threshold: 15, requiredCategories: 1 },
				],
				evaluationMode: "AND",
			});
		});

		it("extrapolates for gates beyond defined ones", () => {
			const gate = getGateDefinition(8);

			expect(gate).toEqual({
				gate: 8,
				requirements: [
					{ threshold: 45, requiredCategories: 1 }, // 40 + 5
					{ threshold: 30, requiredCategories: 1 }, // 25 + 5
				],
				evaluationMode: "AND",
			});
		});
	});

	describe("Gate 1: 10% in 1 category", () => {
		it("passes when 1 category has 10% coverage at poll 3", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 10,
					pollsAnswered: 3,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentRound).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(true);
			expect(result.qualifyingCategories).toEqual(["js"]);
		});

		it("fails when coverage is below 10% at poll 3", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 8,
					pollsAnswered: 3,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(false);
			expect(result.qualifyingCategories).toEqual([]);
		});

		it("always passes on non-checkpoint polls (poll 1, 2)", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 5,
					pollsAnswered: 2,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
			expect(result.isThresholdCheckPoll).toBe(false);
		});
	});

	describe("Gate 2: 15% in 1 OR 10% in 2 categories", () => {
		it("passes with 15% in 1 category (first requirement met)", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 15,
					pollsAnswered: 6,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentRound).toBe(2);
			expect(result.qualifyingCategories).toEqual(["js"]);
		});

		it("passes with 10% in 2 categories (second requirement met)", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 10,
					pollsAnswered: 3,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 10,
					pollsAnswered: 3,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
			expect(result.qualifyingCategories).toEqual(["react", "js"]);
		});

		it("fails when neither requirement is met", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 12,
					pollsAnswered: 6,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(false);
			expect(result.qualifyingCategories).toEqual([]);
		});
	});

	describe("Gate 3: 20% in 1 OR 15% in 2 categories", () => {
		it("passes with 20% in 1 category", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "ts",
					currentCoverage: 20,
					pollsAnswered: 9,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentRound).toBe(3);
		});

		it("passes with 15% in 2 categories", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 15,
					pollsAnswered: 5,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 15,
					pollsAnswered: 4,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
		});
	});

	describe("Gate 5: 30% in 1 AND 15% in another (AND logic)", () => {
		it("passes when both requirements met by different categories", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 30,
					pollsAnswered: 8,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 15,
					pollsAnswered: 7,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentRound).toBe(5);
			expect(result.gateDefinition?.evaluationMode).toBe("AND");
			expect(result.qualifyingCategories).toContain("react");
			expect(result.qualifyingCategories).toContain("js");
		});

		it("fails when only first requirement is met", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 30,
					pollsAnswered: 10,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 10,
					pollsAnswered: 5,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(false);
		});

		it("fails when only second requirement is met", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 20,
					pollsAnswered: 10,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 15,
					pollsAnswered: 5,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(false);
		});

		it("fails when same category meets both thresholds (requires different categories)", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 35,
					pollsAnswered: 15,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(false);
		});
	});

	describe("Gate 6: 35% in 1 AND 20% in another", () => {
		it("passes with different categories meeting requirements", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "ts",
					currentCoverage: 35,
					pollsAnswered: 10,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 20,
					pollsAnswered: 8,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentRound).toBe(6);
		});
	});

	describe("Multi-category scenarios", () => {
		it("uses highest coverage categories for OR conditions", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 12,
					pollsAnswered: 2,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 15,
					pollsAnswered: 2,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 8,
					pollsAnswered: 2,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
			expect(result.qualifyingCategories).toContain("js");
		});

		it("properly excludes used categories in AND mode", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 32,
					pollsAnswered: 6,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 30,
					pollsAnswered: 5,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 20,
					pollsAnswered: 4,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
			expect(result.qualifyingCategories).toHaveLength(2);
		});
	});

	describe("Edge cases", () => {
		it("handles zero polls answered (game start)", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					currentCoverage: 0,
					pollsAnswered: 0,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentRound).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("handles empty category data", () => {
			const result = calculateThresholdInfo([]);

			expect(result.meetsThreshold).toBe(true);
			expect(result.maxCoverage).toBe(0);
		});

		it("handles exact threshold match", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 10,
					pollsAnswered: 3,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
		});
	});

	describe("Real-world scenarios", () => {
		it("passes gate 1 with lucky early coverage", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 15,
					pollsAnswered: 3,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
		});

		it("passes gate 2 with diversified strategy", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 10,
					pollsAnswered: 2,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 12,
					pollsAnswered: 2,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 8,
					pollsAnswered: 2,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentRound).toBe(2);
		});

		it("fails gate 5 without proper category spread", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 45,
					pollsAnswered: 12,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 8,
					pollsAnswered: 3,
				}),
			];

			const result = calculateThresholdInfo(categoryData);

			expect(result.meetsThreshold).toBe(false);
		});
	});
});

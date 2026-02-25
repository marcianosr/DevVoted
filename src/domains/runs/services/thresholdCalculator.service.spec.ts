import { describe, it, expect } from "vitest";

import { GATE_PROGRESSION } from "~/domains/runs/data/gates/gate-progression";
import { createMockRunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";

import {
	calculateThresholdInfo,
	getGateDefinition,
} from "./thresholdCalculator.service";

describe("ThresholdCalculator", () => {
	describe("Gate Definitions", () => {
		it("has correct gate 1 definition (3% in 1 category)", () => {
			const gate = getGateDefinition(1, GATE_PROGRESSION);

			expect(gate).toEqual({
				gate: 1,
				requirements: [{ threshold: 3, requiredCategories: 1 }],
				evaluationMode: "OR",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 2 definition (6% in 1 OR 3% in 2)", () => {
			const gate = getGateDefinition(2, GATE_PROGRESSION);

			expect(gate).toEqual({
				gate: 2,
				requirements: [
					{ threshold: 6, requiredCategories: 1 },
					{ threshold: 3, requiredCategories: 2 },
				],
				evaluationMode: "OR",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 3 definition (12% in 1 OR 8% in 2)", () => {
			const gate = getGateDefinition(3, GATE_PROGRESSION);

			expect(gate).toEqual({
				gate: 3,
				requirements: [
					{ threshold: 12, requiredCategories: 1 },
					{ threshold: 8, requiredCategories: 2 },
				],
				evaluationMode: "OR",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 4 definition (24% in 1 OR 18% in 2 OR 12% in 3)", () => {
			const gate = getGateDefinition(4, GATE_PROGRESSION);

			expect(gate).toEqual({
				gate: 4,
				requirements: [
					{ threshold: 24, requiredCategories: 1 },
					{ threshold: 18, requiredCategories: 2 },
					{ threshold: 12, requiredCategories: 3 },
				],
				evaluationMode: "OR",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 5 definition (24% in 1 AND 24% in another)", () => {
			const gate = getGateDefinition(5, GATE_PROGRESSION);

			expect(gate).toEqual({
				gate: 5,
				requirements: [{ threshold: 24, requiredCategories: 2 }],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 6 definition (45% in 1 OR 30% in 2)", () => {
			const gate = getGateDefinition(6, GATE_PROGRESSION);

			expect(gate).toEqual({
				gate: 6,
				requirements: [
					{ threshold: 45, requiredCategories: 1 },
					{ threshold: 30, requiredCategories: 2 },
				],
				evaluationMode: "OR",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 7 definition (35% in 1 AND 35% in another)", () => {
			const gate = getGateDefinition(7, GATE_PROGRESSION);

			expect(gate).toEqual({
				gate: 7,
				requirements: [{ threshold: 35, requiredCategories: 2 }],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 8 definition (45% + 30% + 15% in 3 categories)", () => {
			const gate = getGateDefinition(8, GATE_PROGRESSION);

			expect(gate).toEqual({
				gate: 8,
				requirements: [
					{ threshold: 45, requiredCategories: 1 },
					{ threshold: 30, requiredCategories: 1 },
					{ threshold: 15, requiredCategories: 1 },
				],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 9 definition (50% + 35% + 20% in 3 categories)", () => {
			const gate = getGateDefinition(9, GATE_PROGRESSION);

			expect(gate).toEqual({
				gate: 9,
				requirements: [
					{ threshold: 50, requiredCategories: 1 },
					{ threshold: 35, requiredCategories: 1 },
					{ threshold: 20, requiredCategories: 1 },
				],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 10 definition (60% + 40% + 25% in 3 categories)", () => {
			const gate = getGateDefinition(10, GATE_PROGRESSION);

			expect(gate).toEqual({
				gate: 10,
				requirements: [
					{ threshold: 60, requiredCategories: 1 },
					{ threshold: 40, requiredCategories: 1 },
					{ threshold: 25, requiredCategories: 1 },
				],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 11 definition (60% + 50% + 40% + 30% in 4 categories)", () => {
			const gate = getGateDefinition(11, GATE_PROGRESSION);

			expect(gate).toEqual({
				gate: 11,
				requirements: [
					{ threshold: 60, requiredCategories: 1 },
					{ threshold: 50, requiredCategories: 1 },
					{ threshold: 40, requiredCategories: 1 },
					{ threshold: 30, requiredCategories: 1 },
				],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});

		it("extrapolates for gates beyond defined ones (gate 12+)", () => {
			const gate = getGateDefinition(12, GATE_PROGRESSION);

			expect(gate).toEqual({
				gate: 12,
				requirements: [
					{ threshold: 65, requiredCategories: 1 }, // 60 + 5
					{ threshold: 55, requiredCategories: 1 }, // 50 + 5
					{ threshold: 45, requiredCategories: 1 }, // 40 + 5
					{ threshold: 35, requiredCategories: 1 }, // 30 + 5
				],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});
	});

	describe("Gate 1: 3% in 1 category", () => {
		it("passes when 1 category has 3% coverage at 5 polls seen", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 4,
					pollsAnswered: 5,
				}),
			];
			const totalPollsSeen = 5;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(true);
			expect(result.qualifyingCategories).toEqual(["js"]);
		});

		it("fails when coverage is below 3% at 5 polls seen", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 2,
					pollsAnswered: 5,
				}),
			];
			const totalPollsSeen = 5;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(false);
			expect(result.qualifyingCategories).toEqual([]);
		});

		it("always passes on non-checkpoint polls (4 polls seen)", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 2,
					pollsAnswered: 4,
				}),
			];
			const totalPollsSeen = 4;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
			expect(result.isThresholdCheckPoll).toBe(false);
		});
	});

	describe("Gate 2: 6% in 1 OR 3% in 2 categories", () => {
		it("passes with 6% in 1 category (first requirement met)", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 6,
					pollsAnswered: 10,
				}),
			];
			const totalPollsSeen = 10;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(2);
			expect(result.qualifyingCategories).toEqual(["js"]);
		});

		it("passes with 3% in 2 categories (second requirement met)", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 3,
					pollsAnswered: 5,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 3,
					pollsAnswered: 5,
				}),
			];
			const totalPollsSeen = 10;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
			expect(result.qualifyingCategories).toEqual(["react", "js"]);
		});

		it("fails when neither requirement is met", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 5,
					pollsAnswered: 5,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 2,
					pollsAnswered: 5,
				}),
			];
			const totalPollsSeen = 10;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(false);
			expect(result.qualifyingCategories).toEqual([]);
		});
	});

	describe("Gate 3: 12% in 1 OR 8% in 2 categories", () => {
		it("passes with 12% in 1 category", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "ts",
					currentCoverage: 12,
					pollsAnswered: 15,
				}),
			];
			const totalPollsSeen = 15;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(3);
		});

		it("passes with 8% in 2 categories", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 8,
					pollsAnswered: 8,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 8,
					pollsAnswered: 7,
				}),
			];
			const totalPollsSeen = 15;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
		});
	});

	describe("Gate 5: 24% in 1 AND 24% in another (AND logic)", () => {
		it("passes when both requirements met by different categories", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 25,
					pollsAnswered: 13,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 24,
					pollsAnswered: 12,
				}),
			];
			const totalPollsSeen = 25;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(5);
			expect(result.gateDefinition?.evaluationMode).toBe("AND");
			expect(result.qualifyingCategories).toContain("react");
			expect(result.qualifyingCategories).toContain("js");
		});

		it("fails when only first requirement is met", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 24,
					pollsAnswered: 17,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 20,
					pollsAnswered: 8,
				}),
			];
			const totalPollsSeen = 25;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(false);
		});

		it("fails when only second requirement is met", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 20,
					pollsAnswered: 17,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 24,
					pollsAnswered: 8,
				}),
			];
			const totalPollsSeen = 25;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(false);
		});

		it("fails when same category meets both thresholds (requires different categories)", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 30,
					pollsAnswered: 25,
				}),
			];
			const totalPollsSeen = 25;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(false);
		});
	});

	describe("Gate 6: 45% in 1 OR 30% in 2", () => {
		it("passes with 45% in 1 category", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "ts",
					currentCoverage: 45,
					pollsAnswered: 16,
				}),
			];
			const totalPollsSeen = 30;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(6);
		});
	});

	describe("Multi-category scenarios", () => {
		it("uses highest coverage categories for OR conditions", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 12,
					pollsAnswered: 3,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 15,
					pollsAnswered: 4,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 8,
					pollsAnswered: 3,
				}),
			];
			const totalPollsSeen = 10;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
			expect(result.qualifyingCategories).toContain("js");
		});

		it("properly excludes used categories in AND mode", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 32,
					pollsAnswered: 10,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 30,
					pollsAnswered: 8,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 20,
					pollsAnswered: 7,
				}),
			];
			const totalPollsSeen = 25;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
			expect(result.qualifyingCategories).toHaveLength(2);
		});
	});

	describe("Edge cases", () => {
		it("handles zero polls seen (game start)", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					currentCoverage: 0,
					pollsAnswered: 0,
				}),
			];
			const totalPollsSeen = 0;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("handles empty category data", () => {
			const totalPollsSeen = 0;
			const result = calculateThresholdInfo(
				[],
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
			expect(result.maxCoverage).toBe(0);
		});

		it("handles exact threshold match", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 4,
					pollsAnswered: 3,
				}),
			];
			const totalPollsSeen = 3;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
		});
	});

	describe("Real-world scenarios", () => {
		it("passes gate 1 with lucky early coverage", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 15,
					pollsAnswered: 5,
				}),
			];
			const totalPollsSeen = 5;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
		});

		it("passes gate 2 with diversified strategy", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 10,
					pollsAnswered: 3,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 12,
					pollsAnswered: 4,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 8,
					pollsAnswered: 3,
				}),
			];
			const totalPollsSeen = 10;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(2);
		});

		it("fails gate 5 without proper category spread", () => {
			const categoryData = [
				createMockRunCategoryCoverage({
					categoryCode: "react",
					currentCoverage: 45,
					pollsAnswered: 20,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 8,
					pollsAnswered: 5,
				}),
			];
			const totalPollsSeen = 25;

			const result = calculateThresholdInfo(
				categoryData,
				totalPollsSeen,
				GATE_PROGRESSION
			);

			expect(result.meetsThreshold).toBe(false);
		});
	});
});

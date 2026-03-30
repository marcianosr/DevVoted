import { describe, it, expect } from "vitest";

import { VANILLA_CI_GATES } from "~/domains/runs/data/gates/vanilla";
import { createMockRunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";

import {
	calculateThresholdInfo,
	generatePostVictoryGate,
	getGateDefinition,
	type EvaluationContext,
	type GateDefinition,
} from "./thresholdCalculator.service";

const makeContext = (
	overrides: Partial<EvaluationContext> & {
		coverages?: ReturnType<typeof createMockRunCategoryCoverage>[];
	} = {}
): EvaluationContext => ({
	categoryCoverageData:
		overrides.coverages ?? overrides.categoryCoverageData ?? [],
	totalPollsSeen: overrides.totalPollsSeen ?? 0,
	correctPollsCount: overrides.correctPollsCount ?? 0,
});

describe("ThresholdCalculator", () => {
	describe("Gate Definitions", () => {
		it("has correct gate 1 definition (3 correct answers OR 3% in 1 category)", () => {
			const gate = getGateDefinition(1, VANILLA_CI_GATES);

			expect(gate).toEqual({
				gate: 1,
				requirements: [
					{ type: "correct-answers", count: 3 },
					{ type: "coverage", threshold: 3, requiredCategories: 1 },
				],
				evaluationMode: "OR",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 2 definition (6% in 1 OR 3% in 2)", () => {
			const gate = getGateDefinition(2, VANILLA_CI_GATES);

			expect(gate).toEqual({
				gate: 2,
				requirements: [
					{ type: "coverage", threshold: 6, requiredCategories: 1 },
					{ type: "coverage", threshold: 3, requiredCategories: 2 },
				],
				evaluationMode: "OR",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 3 definition (12% in 1 OR 8% in 2)", () => {
			const gate = getGateDefinition(3, VANILLA_CI_GATES);

			expect(gate).toEqual({
				gate: 3,
				requirements: [
					{ type: "coverage", threshold: 12, requiredCategories: 1 },
					{ type: "coverage", threshold: 8, requiredCategories: 2 },
				],
				evaluationMode: "OR",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 4 definition (24% in 1 OR 18% in 2 OR 12% in 3)", () => {
			const gate = getGateDefinition(4, VANILLA_CI_GATES);

			expect(gate).toEqual({
				gate: 4,
				requirements: [
					{ type: "coverage", threshold: 24, requiredCategories: 1 },
					{ type: "coverage", threshold: 18, requiredCategories: 2 },
					{ type: "coverage", threshold: 12, requiredCategories: 3 },
				],
				evaluationMode: "OR",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 5 definition (30% in 1 OR 18% in 2 OR 12% in 3 OR 6% in 4)", () => {
			const gate = getGateDefinition(5, VANILLA_CI_GATES);

			expect(gate).toEqual({
				gate: 5,
				requirements: [
					{ type: "coverage", threshold: 30, requiredCategories: 1 },
					{ type: "coverage", threshold: 18, requiredCategories: 2 },
					{ type: "coverage", threshold: 12, requiredCategories: 3 },
					{ type: "coverage", threshold: 6, requiredCategories: 4 },
				],
				evaluationMode: "OR",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 6 definition (41% in 1 OR 32% in 2 OR 24% in 3 OR 18% in 4)", () => {
			const gate = getGateDefinition(6, VANILLA_CI_GATES);

			expect(gate).toEqual({
				gate: 6,
				requirements: [
					{ type: "coverage", threshold: 41, requiredCategories: 1 },
					{ type: "coverage", threshold: 32, requiredCategories: 2 },
					{ type: "coverage", threshold: 24, requiredCategories: 3 },
					{ type: "coverage", threshold: 18, requiredCategories: 4 },
				],
				evaluationMode: "OR",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 7 definition (35% in 1 AND 35% in another)", () => {
			const gate = getGateDefinition(7, VANILLA_CI_GATES);

			expect(gate).toEqual({
				gate: 7,
				requirements: [
					{ type: "coverage", threshold: 35, requiredCategories: 2 },
				],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 8 definition (45% + 30% + 15% in 3 categories)", () => {
			const gate = getGateDefinition(8, VANILLA_CI_GATES);

			expect(gate).toEqual({
				gate: 8,
				requirements: [
					{ type: "coverage", threshold: 45, requiredCategories: 1 },
					{ type: "coverage", threshold: 30, requiredCategories: 1 },
					{ type: "coverage", threshold: 15, requiredCategories: 1 },
				],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 9 definition (50% + 35% + 20% in 3 categories)", () => {
			const gate = getGateDefinition(9, VANILLA_CI_GATES);

			expect(gate).toEqual({
				gate: 9,
				requirements: [
					{ type: "coverage", threshold: 50, requiredCategories: 1 },
					{ type: "coverage", threshold: 35, requiredCategories: 1 },
					{ type: "coverage", threshold: 20, requiredCategories: 1 },
				],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 10 definition (60% + 40% + 25% in 3 categories)", () => {
			const gate = getGateDefinition(10, VANILLA_CI_GATES);

			expect(gate).toEqual({
				gate: 10,
				requirements: [
					{ type: "coverage", threshold: 60, requiredCategories: 1 },
					{ type: "coverage", threshold: 40, requiredCategories: 1 },
					{ type: "coverage", threshold: 25, requiredCategories: 1 },
				],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});

		it("has correct gate 11 definition (60% + 50% + 40% + 30% in 4 categories)", () => {
			const gate = getGateDefinition(11, VANILLA_CI_GATES);

			expect(gate).toEqual({
				gate: 11,
				requirements: [
					{ type: "coverage", threshold: 60, requiredCategories: 1 },
					{ type: "coverage", threshold: 50, requiredCategories: 1 },
					{ type: "coverage", threshold: 40, requiredCategories: 1 },
					{ type: "coverage", threshold: 30, requiredCategories: 1 },
				],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});

		it("extrapolates for gates beyond defined ones (gate 12+)", () => {
			const gate = getGateDefinition(12, VANILLA_CI_GATES);

			expect(gate).toEqual({
				gate: 12,
				requirements: [
					{ type: "coverage", threshold: 65, requiredCategories: 1 }, // 60 + 5
					{ type: "coverage", threshold: 55, requiredCategories: 1 }, // 50 + 5
					{ type: "coverage", threshold: 45, requiredCategories: 1 }, // 40 + 5
					{ type: "coverage", threshold: 35, requiredCategories: 1 }, // 30 + 5
				],
				evaluationMode: "AND",
				pollsPerGate: 5,
			});
		});
	});

	describe("generatePostVictoryGate", () => {
		it("scales coverage requirement thresholds by 5 per gate beyond last", () => {
			const lastGate = VANILLA_CI_GATES[VANILLA_CI_GATES.length - 1];
			const result = generatePostVictoryGate(lastGate, lastGate.gate + 1);

			result.requirements.forEach((req, i) => {
				if (req.type === "coverage") {
					const originalThreshold = (
						lastGate.requirements[i] as { threshold: number }
					).threshold;
					expect(req.threshold).toBe(originalThreshold + 5);
				}
			});
		});

		it("does not scale correct-answers requirements", () => {
			const gateWithMixedRequirements: GateDefinition = {
				gate: 5,
				requirements: [
					{ type: "coverage", threshold: 40, requiredCategories: 1 },
					{ type: "correct-answers", count: 10 },
				],
				evaluationMode: "OR",
				pollsPerGate: 5,
			};

			const result = generatePostVictoryGate(gateWithMixedRequirements, 6);

			const coverageReq = result.requirements.find(
				(r) => r.type === "coverage"
			);
			const correctAnswersReq = result.requirements.find(
				(r) => r.type === "correct-answers"
			);

			expect(coverageReq?.type === "coverage" && coverageReq.threshold).toBe(
				45
			);
			expect(
				correctAnswersReq?.type === "correct-answers" && correctAnswersReq.count
			).toBe(10); // unchanged
		});
	});

	describe("Gate 1: 3% in 1 category", () => {
		it("passes when 1 category has 3% coverage at 5 polls seen", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "js",
						currentCoverage: 4,
						pollsAnswered: 5,
					}),
				],
				totalPollsSeen: 5,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(true);
			expect(result.qualifyingCategories).toEqual(["js"]);
		});

		it("fails when coverage is below 3% at 5 polls seen", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "react",
						currentCoverage: 2,
						pollsAnswered: 5,
					}),
				],
				totalPollsSeen: 5,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(false);
			expect(result.qualifyingCategories).toEqual([]);
		});

		it("always passes on non-checkpoint polls (4 polls seen)", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "css",
						currentCoverage: 2,
						pollsAnswered: 4,
					}),
				],
				totalPollsSeen: 4,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.isThresholdCheckPoll).toBe(false);
		});
	});

	describe("Gate 2: 6% in 1 OR 3% in 2 categories", () => {
		it("passes with 6% in 1 category (first requirement met)", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "js",
						currentCoverage: 6,
						pollsAnswered: 10,
					}),
				],
				totalPollsSeen: 10,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(2);
			expect(result.qualifyingCategories).toEqual(["js"]);
		});

		it("passes with 3% in 2 categories (second requirement met)", () => {
			const context = makeContext({
				coverages: [
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
				],
				totalPollsSeen: 10,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.qualifyingCategories).toEqual(["react", "js"]);
		});

		it("fails when neither requirement is met", () => {
			const context = makeContext({
				coverages: [
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
				],
				totalPollsSeen: 10,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(false);
			expect(result.qualifyingCategories).toEqual([]);
		});
	});

	describe("Gate 3: 12% in 1 OR 8% in 2 categories", () => {
		it("passes with 12% in 1 category", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "ts",
						currentCoverage: 12,
						pollsAnswered: 15,
					}),
				],
				totalPollsSeen: 15,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(3);
		});

		it("passes with 8% in 2 categories", () => {
			const context = makeContext({
				coverages: [
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
				],
				totalPollsSeen: 15,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
		});
	});

	describe("Gate 5: 30% in 1 OR 18% in 2 OR 12% in 3 OR 6% in 4 (OR logic)", () => {
		it("passes with 30% in 1 category", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "react",
						currentCoverage: 31,
						pollsAnswered: 15,
					}),
				],
				totalPollsSeen: 25,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(5);
			expect(result.gateDefinition?.evaluationMode).toBe("OR");
			expect(result.qualifyingCategories).toContain("react");
		});

		it("passes with 18% in 2 categories", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "react",
						currentCoverage: 18,
						pollsAnswered: 12,
					}),
					createMockRunCategoryCoverage({
						categoryCode: "js",
						currentCoverage: 20,
						pollsAnswered: 13,
					}),
				],
				totalPollsSeen: 25,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
		});

		it("fails when no requirement is met", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "react",
						currentCoverage: 29,
						pollsAnswered: 15,
					}),
					createMockRunCategoryCoverage({
						categoryCode: "js",
						currentCoverage: 17,
						pollsAnswered: 10,
					}),
				],
				totalPollsSeen: 25,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(false);
		});
	});

	describe("Gate 6: 45% in 1 OR 30% in 2", () => {
		it("passes with 45% in 1 category", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "ts",
						currentCoverage: 45,
						pollsAnswered: 16,
					}),
				],
				totalPollsSeen: 30,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(6);
		});
	});

	describe("correct-answers requirement", () => {
		const CORRECT_ANSWERS_GATES: GateDefinition[] = [
			{
				gate: 1,
				requirements: [{ type: "correct-answers", count: 3 }],
				evaluationMode: "OR",
				pollsPerGate: 5,
			},
		];

		it("passes when correctPollsCount meets the required count", () => {
			const context = makeContext({
				coverages: [createMockRunCategoryCoverage({ pollsAnswered: 5 })],
				totalPollsSeen: 5,
				correctPollsCount: 3,
			});

			const result = calculateThresholdInfo(context, CORRECT_ANSWERS_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.requirementEvaluations[0].met).toBe(true);
		});

		it("passes when correctPollsCount exceeds the required count", () => {
			const context = makeContext({
				coverages: [createMockRunCategoryCoverage({ pollsAnswered: 5 })],
				totalPollsSeen: 5,
				correctPollsCount: 5,
			});

			const result = calculateThresholdInfo(context, CORRECT_ANSWERS_GATES);

			expect(result.meetsThreshold).toBe(true);
		});

		it("fails when correctPollsCount is below the required count", () => {
			const context = makeContext({
				coverages: [createMockRunCategoryCoverage({ pollsAnswered: 5 })],
				totalPollsSeen: 5,
				correctPollsCount: 2,
			});

			const result = calculateThresholdInfo(context, CORRECT_ANSWERS_GATES);

			expect(result.meetsThreshold).toBe(false);
			expect(result.requirementEvaluations[0].met).toBe(false);
			expect(result.requirementEvaluations[0].qualifyingCategories).toEqual([]);
		});

		it("qualifyingCategories is empty for correct-answers requirements", () => {
			const context = makeContext({
				coverages: [createMockRunCategoryCoverage({ pollsAnswered: 5 })],
				totalPollsSeen: 5,
				correctPollsCount: 4,
			});

			const result = calculateThresholdInfo(context, CORRECT_ANSWERS_GATES);

			expect(result.qualifyingCategories).toEqual([]);
		});

		it("mixes with coverage requirement in OR mode — passes via correct-answers alone", () => {
			const MIXED_GATES: GateDefinition[] = [
				{
					gate: 1,
					requirements: [
						{ type: "coverage", threshold: 50, requiredCategories: 1 },
						{ type: "correct-answers", count: 3 },
					],
					evaluationMode: "OR",
					pollsPerGate: 5,
				},
			];

			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "js",
						currentCoverage: 5, // below coverage threshold
						pollsAnswered: 5,
					}),
				],
				totalPollsSeen: 5,
				correctPollsCount: 3, // meets correct-answers requirement
			});

			const result = calculateThresholdInfo(context, MIXED_GATES);

			expect(result.meetsThreshold).toBe(true);
		});
	});

	describe("Multi-category scenarios", () => {
		it("uses highest coverage categories for OR conditions", () => {
			const context = makeContext({
				coverages: [
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
				],
				totalPollsSeen: 10,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.qualifyingCategories).toContain("js");
		});

		it("properly excludes used categories in AND mode", () => {
			const context = makeContext({
				coverages: [
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
				],
				totalPollsSeen: 25,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.qualifyingCategories).toHaveLength(2);
		});
	});

	describe("Edge cases", () => {
		it("handles zero polls seen (game start)", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						currentCoverage: 0,
						pollsAnswered: 0,
					}),
				],
				totalPollsSeen: 0,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("handles empty category data", () => {
			const context = makeContext({ totalPollsSeen: 0 });

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.maxCoverage).toBe(0);
		});

		it("handles exact threshold match", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "react",
						currentCoverage: 4,
						pollsAnswered: 3,
					}),
				],
				totalPollsSeen: 3,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
		});
	});

	describe("Real-world scenarios", () => {
		it("passes gate 1 with lucky early coverage", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "react",
						currentCoverage: 15,
						pollsAnswered: 5,
					}),
				],
				totalPollsSeen: 5,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
		});

		it("passes gate 2 with diversified strategy", () => {
			const context = makeContext({
				coverages: [
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
				],
				totalPollsSeen: 10,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(true);
			expect(result.currentGate).toBe(2);
		});

		it("fails gate 5 when all categories are just below each threshold", () => {
			const context = makeContext({
				coverages: [
					createMockRunCategoryCoverage({
						categoryCode: "react",
						currentCoverage: 29,
						pollsAnswered: 14,
					}),
					createMockRunCategoryCoverage({
						categoryCode: "js",
						currentCoverage: 17,
						pollsAnswered: 8,
					}),
					createMockRunCategoryCoverage({
						categoryCode: "css",
						currentCoverage: 11,
						pollsAnswered: 3,
					}),
				],
				totalPollsSeen: 25,
			});

			const result = calculateThresholdInfo(context, VANILLA_CI_GATES);

			expect(result.meetsThreshold).toBe(false);
		});
	});
});

import { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

/**
 * CI Gate Configuration
 * Progressive difficulty system that accommodates random poll selection
 *
 * Phase 1 (Gates 1-6): OR conditions provide flexibility (specialize OR diversify)
 * Phase 2 (Gates 7-8): AND conditions require category breadth (2 categories)
 * Phase 3 (Gates 9-11): AND conditions with 3 categories for mastery
 *
 * Total Duration: 55 polls = ~7-8 weeks of daily play
 */
export const VANILLA_CI_GATES: GateDefinition[] = [
	{
		gate: 1,
		requirements: [
			{ type: "correct-answers", count: 3 },
			{ type: "coverage", threshold: 3, requiredCategories: 1 },
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 2,
		requirements: [
			{ type: "coverage", threshold: 6, requiredCategories: 1 },
			{ type: "coverage", threshold: 3, requiredCategories: 2 },
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 3,
		requirements: [
			{ type: "coverage", threshold: 12, requiredCategories: 1 },
			{ type: "coverage", threshold: 8, requiredCategories: 2 },
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 4,
		requirements: [
			{ type: "coverage", threshold: 24, requiredCategories: 1 },
			{ type: "coverage", threshold: 18, requiredCategories: 2 },
			{ type: "coverage", threshold: 12, requiredCategories: 3 },
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 5,
		requirements: [
			{ type: "coverage", threshold: 30, requiredCategories: 1 },
			{ type: "coverage", threshold: 18, requiredCategories: 2 },
			{ type: "coverage", threshold: 12, requiredCategories: 3 },
			{ type: "coverage", threshold: 6, requiredCategories: 4 },
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 6,
		requirements: [
			{ type: "coverage", threshold: 41, requiredCategories: 1 },
			{ type: "coverage", threshold: 32, requiredCategories: 2 },
			{ type: "coverage", threshold: 24, requiredCategories: 3 },
			{ type: "coverage", threshold: 18, requiredCategories: 4 },
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 7,
		requirements: [{ type: "coverage", threshold: 35, requiredCategories: 2 }],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
	{
		gate: 8,
		requirements: [
			{ type: "coverage", threshold: 45, requiredCategories: 1 },
			{ type: "coverage", threshold: 30, requiredCategories: 1 },
			{ type: "coverage", threshold: 15, requiredCategories: 1 },
		],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
	{
		gate: 9,
		requirements: [
			{ type: "coverage", threshold: 50, requiredCategories: 1 },
			{ type: "coverage", threshold: 35, requiredCategories: 1 },
			{ type: "coverage", threshold: 20, requiredCategories: 1 },
		],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
	{
		gate: 10,
		requirements: [
			{ type: "coverage", threshold: 60, requiredCategories: 1 },
			{ type: "coverage", threshold: 40, requiredCategories: 1 },
			{ type: "coverage", threshold: 25, requiredCategories: 1 },
		],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
	{
		gate: 11,
		requirements: [
			{ type: "coverage", threshold: 60, requiredCategories: 1 },
			{ type: "coverage", threshold: 50, requiredCategories: 1 },
			{ type: "coverage", threshold: 40, requiredCategories: 1 },
			{ type: "coverage", threshold: 30, requiredCategories: 1 },
		],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
];

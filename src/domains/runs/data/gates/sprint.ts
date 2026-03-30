import { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

export const SPRINT_CI_GATES: GateDefinition[] = [
	{
		gate: 1,
		requirements: [{ type: "coverage", threshold: 5, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 3,
	},
	// Player chooses their path — EITHER (OR):
	// - Get 1 category to 4%, OR
	// - Get 2 categories to 2%
	{
		gate: 2,
		requirements: [{ type: "coverage", threshold: 10, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 2,
	},
	{
		gate: 3,
		requirements: [{ type: "coverage", threshold: 20, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 2,
	},
	{
		gate: 4,
		requirements: [
			{ type: "coverage", threshold: 30, requiredCategories: 1 },
			{ type: "coverage", threshold: 15, requiredCategories: 2 },
		],
		evaluationMode: "OR",
		pollsPerGate: 2,
	},
	{
		gate: 5,
		requirements: [
			{ type: "coverage", threshold: 40, requiredCategories: 1 },
			{ type: "coverage", threshold: 25, requiredCategories: 2 },
		],
		evaluationMode: "OR",
		pollsPerGate: 2,
	},
];

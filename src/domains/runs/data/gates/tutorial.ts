import { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

export const TUTORIAL_CI_GATES: GateDefinition[] = [
	{
		gate: 1,
		requirements: [{ type: "coverage", threshold: 2, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 3,
	},
	{
		gate: 2,
		requirements: [
			{ type: "coverage", threshold: 4, requiredCategories: 1 },
			{ type: "coverage", threshold: 2, requiredCategories: 2 },
		],
		evaluationMode: "OR",
		pollsPerGate: 3,
	},
	{
		gate: 3,
		requirements: [
			{ type: "coverage", threshold: 8, requiredCategories: 1 },
			{ type: "coverage", threshold: 4, requiredCategories: 2 },
		],
		evaluationMode: "AND",
		pollsPerGate: 3,
	},
];

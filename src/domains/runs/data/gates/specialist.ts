import { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

export const SPECIALIST_CI_GATES: GateDefinition[] = [
	{
		gate: 1,
		requirements: [{ type: "coverage", threshold: 5, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 7,
	},
	{
		gate: 2,
		requirements: [{ type: "coverage", threshold: 9, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 6,
	},
	{
		gate: 3,
		requirements: [{ type: "coverage", threshold: 16, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 6,
	},
	{
		gate: 4,
		requirements: [{ type: "coverage", threshold: 26, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 5,
		requirements: [{ type: "coverage", threshold: 35, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 6,
		requirements: [{ type: "coverage", threshold: 50, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 7,
		requirements: [{ type: "coverage", threshold: 65, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 3,
	},
	{
		gate: 8,
		requirements: [{ type: "coverage", threshold: 75, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 3,
	},
];

import { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

export const SPECIALIST_CI_GATES: GateDefinition[] = [
	{
		gate: 1,
		requirements: [{ threshold: 5, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 7,
	},
	{
		gate: 2,
		requirements: [{ threshold: 9, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 6,
	},
	{
		gate: 3,
		requirements: [{ threshold: 16, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 6,
	},
	{
		gate: 4,
		requirements: [{ threshold: 26, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 5,
		requirements: [{ threshold: 35, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 6,
		requirements: [{ threshold: 50, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 7,
		requirements: [{ threshold: 65, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 3,
	},
	{
		gate: 8,
		requirements: [{ threshold: 75, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 3,
	},
];

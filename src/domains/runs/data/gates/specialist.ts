import { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

export const SPECIALIST_CI_GATES: GateDefinition[] = [
	{
		gate: 1,
		requirements: [{ threshold: 10, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 7,
	},
	{
		gate: 2,
		requirements: [{ threshold: 20, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 6,
	},
	{
		gate: 3,
		requirements: [{ threshold: 35, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 4,
		requirements: [{ threshold: 50, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 5,
		requirements: [{ threshold: 70, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 6,
		requirements: [{ threshold: 85, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 7,
		requirements: [{ threshold: 100, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 3,
	},
];

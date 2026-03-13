import { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

/**
 * Universal Gate Progression Curve
 *
 * Defines the threshold requirements for each gate number.
 * All gate types (Generalist, Comeback, Sprint, etc.) share this progression —
 * they only differ in behavior modifiers, not in threshold requirements.
 *
 * Phase 1 (Gates 1-4): OR conditions provide flexibility (specialize OR diversify)
 * Phase 2 (Gates 5-7): AND conditions require category breadth (2 categories)
 * Phase 3 (Gates 8-10): AND conditions with 3 categories for mastery
 *
 * Total Duration: 50 polls = ~7 weeks of daily play
 */
export const GATE_PROGRESSION: GateDefinition[] = [
	{
		gate: 1,
		requirements: [{ threshold: 3, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 2,
	},
	{
		gate: 2,
		requirements: [
			{ threshold: 6, requiredCategories: 1 },
			{ threshold: 3, requiredCategories: 2 },
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 3,
		requirements: [
			{ threshold: 12, requiredCategories: 1 },
			{ threshold: 8, requiredCategories: 2 },
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 4,
		requirements: [
			{ threshold: 24, requiredCategories: 1 },
			{ threshold: 18, requiredCategories: 2 },
			{ threshold: 12, requiredCategories: 3 },
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 5,
		requirements: [{ threshold: 24, requiredCategories: 2 }],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
	{
		gate: 6,
		requirements: [
			{ threshold: 45, requiredCategories: 1 },
			{ threshold: 30, requiredCategories: 2 },
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 7,
		requirements: [{ threshold: 35, requiredCategories: 2 }],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
	{
		gate: 8,
		requirements: [
			{ threshold: 45, requiredCategories: 1 },
			{ threshold: 30, requiredCategories: 1 },
			{ threshold: 15, requiredCategories: 1 },
		],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
	{
		gate: 9,
		requirements: [
			{ threshold: 50, requiredCategories: 1 },
			{ threshold: 35, requiredCategories: 1 },
			{ threshold: 20, requiredCategories: 1 },
		],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
	{
		gate: 10,
		requirements: [
			{ threshold: 60, requiredCategories: 1 },
			{ threshold: 40, requiredCategories: 1 },
			{ threshold: 25, requiredCategories: 1 },
		],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
	{
		gate: 11,
		requirements: [
			{ threshold: 60, requiredCategories: 1 },
			{ threshold: 50, requiredCategories: 1 },
			{ threshold: 40, requiredCategories: 1 },
			{ threshold: 30, requiredCategories: 1 },
		],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
];

import { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

/**
 * CI Gate Configuration
 * Progressive difficulty system that accommodates random poll selection
 *
 * Phase 1 (Gates 1-4): OR conditions provide flexibility (specialize OR diversify)
 * Phase 2 (Gates 5-7): AND conditions require category breadth (2 categories)
 * Phase 3 (Gates 8-10): AND conditions with 3 categories for mastery
 *
 * Total Duration: 50 polls = ~7 weeks of daily play
 */
export const VANILLA_CI_GATES: GateDefinition[] = [
	// Phase 1: Learning & Strategy (Gates 1-4)
	{
		gate: 1,
		requirements: [{ threshold: 2, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 2,
		requirements: [
			{ threshold: 4, requiredCategories: 1 },
			{ threshold: 2, requiredCategories: 2 },
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 3,
		requirements: [
			{ threshold: 8, requiredCategories: 1 },
			{ threshold: 4, requiredCategories: 2 },
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	{
		gate: 4,
		requirements: [
			{ threshold: 12, requiredCategories: 1 },
			{ threshold: 6, requiredCategories: 2 }, // Fixed: was 12, now rewards diversification
		],
		evaluationMode: "OR",
		pollsPerGate: 5,
	},
	// Phase 2: Mastery - Two Categories (Gates 5-7)
	{
		gate: 5,
		requirements: [
			{ threshold: 25, requiredCategories: 1 },
			{ threshold: 15, requiredCategories: 1 },
		],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
	{
		gate: 6,
		requirements: [
			{ threshold: 35, requiredCategories: 1 },
			{ threshold: 20, requiredCategories: 1 },
		],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
	{
		gate: 7,
		requirements: [
			{ threshold: 40, requiredCategories: 1 },
			{ threshold: 25, requiredCategories: 1 },
		],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
	// Phase 3: Ultimate Challenge - Three Categories (Gates 8-10)
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
			{ threshold: 55, requiredCategories: 1 },
			{ threshold: 40, requiredCategories: 1 },
			{ threshold: 25, requiredCategories: 1 },
		],
		evaluationMode: "AND",
		pollsPerGate: 5,
	},
];

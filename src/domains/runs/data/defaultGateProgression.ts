import type { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

/**
 * The default gate progression used for all runs.
 * Defines coverage requirements per gate position — independent of which
 * HttpGate flavor the player chose. Constraints and rewards sit on top of this;
 * the thresholds here are fixed by position.
 *
 * Phase 1 (Gates 1-4): OR conditions — specialize or diversify
 * Phase 2 (Gates 5-7): AND conditions — requires breadth across 2 categories
 * Phase 3 (Gates 8-11): AND conditions — 3+ category mastery
 *
 * Total duration: 55 polls = ~7 weeks of daily play
 */
export const DEFAULT_GATE_PROGRESSION: GateDefinition[] = [
	{
		gate: 1,
		requirements: [{ threshold: 3, requiredCategories: 1 }],
		evaluationMode: "OR",
		pollsPerGate: 5,
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

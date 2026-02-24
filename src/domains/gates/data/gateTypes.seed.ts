import type {
	GateModifierConfig,
	GateStake,
} from "~/domains/gates/models/gateType";

export type GateTypeSeedData = {
	code: string;
	name: string;
	description: string;
	stake: GateStake;
	pollsPerGate: number;
	modifierConfig: GateModifierConfig;
};

/**
 * Default gate type definitions for seeding the database.
 * These define the available gate types players can choose from.
 */
export const GATE_TYPES_SEED: GateTypeSeedData[] = [
	{
		code: "generalist",
		name: "Generalist",
		description:
			"Standard CI pipeline. Balanced requirements across categories. A safe choice for steady progress.",
		stake: "easy",
		pollsPerGate: 5,
		modifierConfig: {
			wrongAnswerCoverageRate: 1, // Normal penalty scaling
		},
	},
	{
		code: "comeback",
		name: "Comeback",
		description:
			"Forgiving pipeline. Wrong answers are neutral (no penalty). Great for learning and recovery.",
		stake: "very_easy",
		pollsPerGate: 5,
		modifierConfig: {
			wrongAnswerCoverageRate: 0, // Neutral: no penalty on wrong answers
		},
	},
];

/**
 * The default gate type code that all runs start with.
 */
export const DEFAULT_GATE_TYPE_CODE = "generalist";

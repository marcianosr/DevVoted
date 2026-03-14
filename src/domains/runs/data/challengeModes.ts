import { SPECIALIST_CI_GATES } from "~/domains/runs/data/gates/specialist";
import { SPRINT_CI_GATES } from "~/domains/runs/data/gates/sprint";
import { DEFAULT_GATE_PROGRESSION } from "~/domains/runs/data/defaultGateProgression";
import { type GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

/**
 * Challenge Mode Definition
 * Represents a player-selectable game difficulty/style
 */
export type ChallengeMode = {
	id: ChallengeModeId;
	name: string;
	description: string;
	gates: GateDefinition[];
};

export type ChallengeModeId = "vanilla" | "sprint" | "specialist";

/**
 * Available challenge modes
 * Players select one when starting a new run
 */
export const CHALLENGE_MODES: Record<ChallengeModeId, ChallengeMode> = {
	vanilla: {
		id: "vanilla",
		name: "Vanilla",
		description: "Standard, easy progression with all categories",
		gates: DEFAULT_GATE_PROGRESSION,
	},
	sprint: {
		id: "sprint",
		name: "Sprint",
		description: "Quick and easy mode for short play sessions",
		gates: SPRINT_CI_GATES,
	},
	specialist: {
		id: "specialist",
		name: "Specialist",
		description:
			"Focus on excelling in a single category with tougher requirements",
		gates: SPECIALIST_CI_GATES,
	},

	// Future modes can be added here:
	// frontend_only: { ... }
	// hardcore: { ... }
};

export const getChallengeModeById = (
	id: ChallengeModeId
): ChallengeMode | undefined => CHALLENGE_MODES[id];

export const getChallengeModeOrDefault = (id: string): ChallengeMode =>
	CHALLENGE_MODES[id as ChallengeModeId] ?? CHALLENGE_MODES["vanilla"];

export const getAllChallengeModes = (): ChallengeMode[] =>
	Object.values(CHALLENGE_MODES);

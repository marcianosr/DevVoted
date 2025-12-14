import { TUTORIAL_CI_GATES } from "~/domains/runs/data/gates/tutorial";
import { VANILLA_CI_GATES } from "~/domains/runs/data/gates/vanilla";
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

export type ChallengeModeId = "vanilla" | "tutorial";

/**
 * Available challenge modes
 * Players select one when starting a new run
 */
export const CHALLENGE_MODES: Record<ChallengeModeId, ChallengeMode> = {
	vanilla: {
		id: "vanilla",
		name: "Vanilla",
		description: "Standard, easy progression with all categories",
		gates: VANILLA_CI_GATES,
	},
	tutorial: {
		id: "tutorial",
		name: "Tutorial",
		description:
			"Introductory mode with simplified gates to learn the mechanics",
		gates: TUTORIAL_CI_GATES,
	},
	// Future modes can be added here:
	// frontend_only: { ... }
	// hardcore: { ... }
};

export const getChallengeModeById = (
	id: ChallengeModeId
): ChallengeMode | undefined => CHALLENGE_MODES[id];

export const getChallengeModeOrDefault = (id: ChallengeModeId): ChallengeMode =>
	CHALLENGE_MODES[id] ?? CHALLENGE_MODES["vanilla"];

export const getAllChallengeModes = (): ChallengeMode[] =>
	Object.values(CHALLENGE_MODES);

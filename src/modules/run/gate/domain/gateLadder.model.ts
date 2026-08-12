import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";

export type GateOutcomeStatus = "pass" | "fail" | "skip";

export type GateOutcome = {
	readonly gate: number;
	readonly status: GateOutcomeStatus;
};

/**
 * The full gate ladder for the end-of-run screen: one entry per gate, gate 0
 * through `finalGate`. `gatesCleared` gates passed; on a lost run the gate the player was
 * standing on is where the pipeline broke (fail); everything beyond was never
 * reached (skip). A won run clears the whole ladder, so no fail/skip rows appear.
 */
export const deriveGateLadder = (
	gatesCleared: number,
	won: boolean,
	finalGate: number = VICTORY_GATE
): readonly GateOutcome[] => {
	const statusFor = (gate: number): GateOutcomeStatus => {
		if (gate < gatesCleared) return "pass";
		if (!won && gate === gatesCleared) return "fail";
		return "skip";
	};

	return Array.from({ length: Math.max(0, finalGate + 1) }, (_, gate) => ({
		gate,
		status: statusFor(gate),
	}));
};

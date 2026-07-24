import { VICTORY_GATE } from "../rules.model";

export type GateOutcomeStatus = "pass" | "fail" | "skip";

export type GateOutcome = {
	readonly gate: number;
	readonly status: GateOutcomeStatus;
};

/**
 * The full gate ladder for the end-of-run screen: one entry per gate from 1 to
 * `victoryGate`. Gates up to `gatesCleared` passed; on a lost run the very next
 * gate is where the pipeline broke (fail); everything beyond was never reached
 * (skip). A won run clears the whole ladder, so no fail/skip rows appear.
 */
export const deriveGateLadder = (
	gatesCleared: number,
	won: boolean,
	victoryGate: number = VICTORY_GATE
): readonly GateOutcome[] => {
	const statusFor = (gate: number): GateOutcomeStatus => {
		if (gate <= gatesCleared) return "pass";
		if (!won && gate === gatesCleared + 1) return "fail";
		return "skip";
	};

	return Array.from({ length: victoryGate }, (_, index) => {
		const gate = index + 1;
		return { gate, status: statusFor(gate) };
	});
};

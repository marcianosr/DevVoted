import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import type {
	GateClosing,
	GateHoldReason,
} from "~/modules/run/gate/domain/gate.model";

export type OutcomeRevealKind =
	"cleared" | "perfect" | "shaky" | "caught" | "ended";

export type RevealedClose = {
	readonly closing: GateClosing;
	readonly band: CoverageBandId;
	readonly heldBy?: GateHoldReason;
};

export const revealKindOf = ({
	closing,
	band,
	heldBy,
}: RevealedClose): OutcomeRevealKind => {
	if (closing === "fatal") return "ended";
	if (closing === "held") return heldBy === "catch" ? "caught" : "shaky";
	return band === "perfect" ? "perfect" : "cleared";
};

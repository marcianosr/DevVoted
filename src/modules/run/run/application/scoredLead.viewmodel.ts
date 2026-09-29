import { scoringSlotsAt } from "~/modules/run/build/domain/coverageRatio.model";
import {
	roundToOneDecimal,
	roundToTwoDecimals,
} from "~/modules/run/run/domain/rules.model";

import {
	type CoverageLadder,
	coverageBandOf,
} from "~/ui/kanto-theme/CoverageBar.ui";
import type { LeadLine } from "~/ui/kanto-theme/Lead.ui";

const SCORED_LEAD = "You have scored ";
const SCORED_JOIN = " units across ";
const SCORED_JOIN_ONE = " unit across ";
const SCORED_TRAIL = " slots, which is ";
const SCORED_CLOSE = " coverage.";

export type ScoredFrame = {
	gate: number;
	unitsHeld: number;
	held: number;
	ladder: CoverageLadder;
};

const coveragePercent = (held: number): string =>
	`${roundToOneDecimal(held).toFixed(1)}%`;

export const scoredLeadFor = ({
	gate,
	unitsHeld,
	held,
	ladder,
}: ScoredFrame): LeadLine => {
	const units = roundToTwoDecimals(unitsHeld);
	const band = coverageBandOf(held, ladder);

	return [
		SCORED_LEAD,
		{ figure: `${units}`, band },
		units === 1 ? SCORED_JOIN_ONE : SCORED_JOIN,
		{ figure: `${scoringSlotsAt(gate)}` },
		SCORED_TRAIL,
		{ figure: coveragePercent(held), band },
		SCORED_CLOSE,
	];
};

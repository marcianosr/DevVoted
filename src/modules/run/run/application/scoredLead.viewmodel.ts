import { roundToOneDecimal } from "~/modules/run/run/domain/rules.model";

import {
	bandAtLadder,
	type GateLadder,
} from "~/modules/run/gate/domain/gate.model";

import type { LeadLine } from "~/ui/kanto-theme/Lead.ui";

const SCORED_LEAD = "You hold ";
const SCORED_CLOSE = " coverage.";

export type ScoredFrame = {
	held: number;
	ladder: GateLadder;
};

const coveragePercent = (held: number): string =>
	`${roundToOneDecimal(held).toFixed(1)}%`;

export const scoredLeadFor = ({ held, ladder }: ScoredFrame): LeadLine => {
	const band = bandAtLadder(held, ladder).id;

	return [SCORED_LEAD, { figure: coveragePercent(held), band }, SCORED_CLOSE];
};

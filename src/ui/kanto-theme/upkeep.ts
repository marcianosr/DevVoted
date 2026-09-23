import { kbLabel } from "~/shared/lib/storage";

const A_GATE = "a gate";
const FREE_WORD = "free";
const NO_UPKEEP = 0;

/**
 * Its own module rather than a member of either surface that states it: the
 * Build header and the weight track both read it, and `Build.ui` imports
 * `WeightTrack.ui`, so either home would be a cycle.
 */
export const upkeepLabelOf = (kb: number): string =>
	kb === NO_UPKEEP ? FREE_WORD : `${kbLabel(kb)} ${A_GATE}`;

export const RECURRING_GLYPH = "↻";

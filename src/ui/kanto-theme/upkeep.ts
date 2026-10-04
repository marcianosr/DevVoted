import { kbLabel } from "~/shared/lib/storage";

const A_GATE = "a gate";
const FREE_WORD = "free";
const NO_UPKEEP = 0;

export const upkeepLabelOf = (kb: number): string =>
	kb === NO_UPKEEP ? FREE_WORD : `${kbLabel(kb)} ${A_GATE}`;

export const RECURRING_GLYPH = "↻";

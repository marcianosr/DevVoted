import type { CommunityOptionBreakdown } from "~/domains/polls/api/communityStats.queries";

/**
 * Sort options for the Community breakdown.
 *
 * Decision context — agreed v1 rules:
 *   - Correct options first (revealing the answer is fine here; the user
 *     has already submitted by the time this renders).
 *   - Within the correct group AND within the incorrect group, the tie-
 *     breaker is open. Candidates worth considering:
 *       a) `voters.length` desc — surfaces the "popular wrong answer"
 *          (educational: this is where people stumbled).
 *       b) `optionId` asc — preserves original poll order (matches the
 *          question UI; least surprising).
 *       c) Alphabetical by `optionText` — neutral but unhelpful here.
 *
 * The choice shapes the *story* the breakdown tells:
 *   - (a) reads as "here's what people thought" — emphasises consensus.
 *   - (b) reads as "here are the options, with how the room split" —
 *     emphasises the original question structure.
 */
export const sortCommunityOptions = (
	options: CommunityOptionBreakdown[]
): CommunityOptionBreakdown[] => {
	// TODO: implement.
	// Pure, non-mutating — return a new array. Don't sort in place.
	return options;
};

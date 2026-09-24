import { getCategoryMetadata } from "~/shared/lib/categories";

import {
	type CategoryLeader,
	type CategorySeat,
	MIN_LEADER_STREAK,
} from "~/modules/run/run/domain/categoryLeader.model";

import type {
	CategoryLeaderProps,
	CategorySeatLeader,
} from "~/ui/kanto-theme/CategoryLeader.ui";

const IN_A_ROW = (streak: number) => `${streak} in a row`;
const CLAIMS_IT = (streak: number) => `${IN_A_ROW(streak)} claims it`;

const leaderRowOf = (leader: CategoryLeader): CategorySeatLeader => ({
	handle: leader.handle,
	figure: IN_A_ROW(leader.streak),
	you: leader.you,
	...(leader.githubLogin === undefined
		? {}
		: { githubLogin: leader.githubLogin }),
	...(leader.avatarUrl === undefined ? {} : { photoUrl: leader.avatarUrl }),
	...(leader.borderUrl === undefined ? {} : { borderUrl: leader.borderUrl }),
});

/**
 * One seat, as both surfaces state it: the poll screen for the category being
 * played, the community board for all twelve.
 *
 * One owner for the row's words (ADR-102). The figure and the claim are the
 * same sentence on either screen, and a second copy of them is how the board
 * and the poll screen would drift into quoting different floors.
 *
 * An open seat says what claims it rather than saying nothing. A player who
 * cannot see the bar has no reason to aim at it.
 */
export const categoryLeaderRowFor = (
	seat: CategorySeat
): CategoryLeaderProps => ({
	category: getCategoryMetadata(seat.category).name,
	...(seat.leader === undefined
		? { claim: CLAIMS_IT(MIN_LEADER_STREAK) }
		: { leader: leaderRowOf(seat.leader) }),
});

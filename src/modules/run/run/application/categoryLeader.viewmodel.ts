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

export const categoryLeaderRowFor = (
	seat: CategorySeat
): CategoryLeaderProps => ({
	category: getCategoryMetadata(seat.category).name,
	...(seat.leader === undefined
		? { claim: CLAIMS_IT(MIN_LEADER_STREAK) }
		: { leader: leaderRowOf(seat.leader) }),
});

import { getCategoryMetadata } from "~/shared/lib/categories";
import { IN_A_ROW, MOST_CORRECT } from "~/shared/lib/copy";
import { plural } from "~/shared/lib/displayValue";

import {
	type CategoryBoard,
	type CategoryLeader,
	type CategoryMeasure,
	type CategorySeat,
	MIN_LEADER,
} from "~/modules/run/run/domain/categoryLeader.model";

import type {
	CategoryLeaderProps,
	CategorySeatLeader,
} from "~/ui/kanto-theme/CategoryLeader.ui";
import type { CommunityLeaders } from "~/ui/kanto-theme/CommunityScreen.ui";

const FIGURE = {
	streak: IN_A_ROW,
	correct: MOST_CORRECT,
} satisfies Record<CategoryMeasure, (best: number) => string>;

const HEADING = {
	streak: {
		title: "streak",
		summary: "longest run of correct answers in one run · all-time",
	},
	correct: {
		title: "correct",
		summary: "most correct answers in one run · all-time",
	},
} satisfies Record<CategoryMeasure, { title: string; summary: string }>;

const SEATS_CHANGE_HANDS = "A seat changes hands when somebody beats it.";

const CLAIMS_IT = (measure: CategoryMeasure) =>
	`${FIGURE[measure](MIN_LEADER[measure])} claims it`;

const leaderRowOf = (
	measure: CategoryMeasure,
	leader: CategoryLeader
): CategorySeatLeader => ({
	userId: leader.userId,
	handle: leader.handle,
	figure: FIGURE[measure](leader.best),
	you: leader.you,
	...(leader.avatarUrl === undefined ? {} : { photoUrl: leader.avatarUrl }),
	...(leader.borderUrl === undefined ? {} : { borderUrl: leader.borderUrl }),
});

export const categoryLeaderRowFor = (
	measure: CategoryMeasure,
	seat: CategorySeat
): CategoryLeaderProps => ({
	category: getCategoryMetadata(seat.category).name,
	...(seat.leader === undefined
		? { claim: CLAIMS_IT(measure) }
		: { leader: leaderRowOf(measure, seat.leader) }),
});

export const seatsFooterFor = (seats: readonly CategorySeat[]): string => {
	const open = seats.filter(({ leader }) => leader === undefined).length;
	if (open === 0) return SEATS_CHANGE_HANDS;

	return `${SEATS_CHANGE_HANDS} ${plural(open, "seat")} still open.`;
};

export const categoryBoardFor = ({
	measure,
	seats,
}: CategoryBoard): CommunityLeaders => ({
	title: HEADING[measure].title,
	summary: HEADING[measure].summary,
	seats: seats.map((seat) => categoryLeaderRowFor(measure, seat)),
	footer: seatsFooterFor(seats),
});

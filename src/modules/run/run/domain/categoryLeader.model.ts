import { CATEGORY_CODES, type CategoryCode } from "~/shared/lib/categories";

export type CategoryLeader = {
	readonly userId: string;
	readonly handle: string;
	readonly githubLogin?: string;
	readonly avatarUrl?: string;
	readonly borderUrl?: string;
	readonly streak: number;
	readonly you: boolean;
};

export type CategorySeat = {
	readonly category: CategoryCode;
	readonly leader?: CategoryLeader;
};

export const MIN_LEADER_STREAK = 3;

export const isLeadingStreak = (streak: number): boolean =>
	streak >= MIN_LEADER_STREAK;

const streakOf = (seat: CategorySeat): number => seat.leader?.streak ?? 0;

export const seatsFor = (held: readonly CategorySeat[]): CategorySeat[] => {
	const byCategory = new Map(held.map((seat) => [seat.category, seat]));

	return CATEGORY_CODES.map(
		(category): CategorySeat => byCategory.get(category) ?? { category }
	).sort((a, b) => streakOf(b) - streakOf(a));
};

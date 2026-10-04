import { CATEGORY_CODES, type CategoryCode } from "~/shared/lib/categories";

export const CATEGORY_MEASURES = ["streak", "correct"] as const;

export type CategoryMeasure = (typeof CATEGORY_MEASURES)[number];

export type CategoryLeader = {
	readonly userId: string;
	readonly handle: string;
	readonly avatarUrl?: string;
	readonly borderUrl?: string;
	readonly best: number;
	readonly you: boolean;
};

export type CategorySeat = {
	readonly category: CategoryCode;
	readonly leader?: CategoryLeader;
};

export type CategoryBoard = {
	readonly measure: CategoryMeasure;
	readonly seats: readonly CategorySeat[];
};

export type CategoryBoards = Readonly<
	Record<CategoryMeasure, readonly CategorySeat[]>
>;

export const MIN_LEADER = {
	streak: 3,
	correct: 4,
} satisfies Record<CategoryMeasure, number>;

export const isLeading = (measure: CategoryMeasure, best: number): boolean =>
	best >= MIN_LEADER[measure];

const bestOf = (seat: CategorySeat): number => seat.leader?.best ?? 0;

export const seatsFor = (held: readonly CategorySeat[]): CategorySeat[] => {
	const byCategory = new Map(held.map((seat) => [seat.category, seat]));

	return CATEGORY_CODES.map(
		(category): CategorySeat => byCategory.get(category) ?? { category }
	).sort((a, b) => bestOf(b) - bestOf(a));
};

export const boardsFor = (held: CategoryBoards): readonly CategoryBoard[] =>
	CATEGORY_MEASURES.map((measure) => ({
		measure,
		seats: seatsFor(held[measure]),
	}));

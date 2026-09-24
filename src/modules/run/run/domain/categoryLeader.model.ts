import { CATEGORY_CODES, type CategoryCode } from "~/shared/lib/categories";

/**
 * The account holding a category's longest run of correct answers.
 *
 * `streak` counts correct answers only. A partial neither extends nor breaks a
 * run — the same rule `nextStreak` applies inside a run, because a figure that
 * disagreed with the engine would teach the player the wrong thing about their
 * own answers.
 */
export type CategoryLeader = {
	/** `@login` when there is a GitHub account behind it, the display name otherwise. */
	readonly handle: string;
	/**
	 * Absent for an account that never signed in through GitHub. Without it the
	 * handle is stated rather than linked: an email signup has no profile to
	 * point at, and guessing one from the name is how the byline once invented
	 * a stranger's avatar (DVTD-at5o).
	 */
	readonly githubLogin?: string;
	readonly avatarUrl?: string;
	readonly borderUrl?: string;
	readonly streak: number;
	/** This account holds it. The row rings the avatar and greens the figure. */
	readonly you: boolean;
};

/**
 * A category and whoever leads it: the longest run of correct answers anyone
 * has strung together in it. No leader means the seat is open.
 *
 * All-time on purpose. Seasons exist as a table and nothing else, so a
 * season-scoped record would silently mean "since the dawn of time" anyway —
 * better to say so.
 *
 * The figure is a **personal best**, never a live streak. A live figure would
 * move under the player mid-poll and turn a target into a distraction; a best
 * is a number to beat, and beating it is the whole point of stating it. It also
 * means a seat is never lost by missing, only taken by somebody going further.
 */
export type CategorySeat = {
	readonly category: CategoryCode;
	readonly leader?: CategoryLeader;
};

/**
 * Below this the seat stays open, however well someone is doing.
 *
 * Two correct answers in a row is not evidence of anything, and a seat that
 * cheap devalues every category that earned one honestly. The floor is what
 * makes an open seat an invitation rather than an error state.
 */
export const MIN_LEADER_STREAK = 3;

export const isLeadingStreak = (streak: number): boolean =>
	streak >= MIN_LEADER_STREAK;

const streakOf = (seat: CategorySeat): number => seat.leader?.streak ?? 0;

/**
 * Every category, held seats first and longest run at the top, open seats
 * below.
 *
 * Twelve rows always: a category missing from the read is an open seat, not an
 * absent one, and dropping it would make a young category look like a broken
 * feature. Seats are laid out in category order before sorting, so equal
 * streaks keep that order — `sort` is stable, and a board that reshuffled two
 * equal records between two identical requests would read as noise.
 */
export const seatsFor = (held: readonly CategorySeat[]): CategorySeat[] => {
	const byCategory = new Map(held.map((seat) => [seat.category, seat]));

	return CATEGORY_CODES.map(
		(category): CategorySeat => byCategory.get(category) ?? { category }
	).sort((a, b) => streakOf(b) - streakOf(a));
};

import { CATEGORY_METADATA, type CategoryCode } from "~/shared/lib/categories";

/**
 * The account holding a category's longest run of correct answers.
 *
 * `streak` counts correct answers only. A partial neither extends nor breaks a
 * run — the same rule `nextStreak` applies inside a run, because a figure that
 * disagreed with the engine would teach the player the wrong thing about their
 * own answers.
 */
export type CategoryRecordHolder = {
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
	/** This account holds it. The row rings the avatar and drops the trailing. */
	readonly you: boolean;
};

/**
 * A category's living record: the longest run of correct answers anyone has
 * strung together in it, and the longest this account has.
 *
 * All-time on purpose. Seasons exist as a table and nothing else, so a
 * season-scoped record would silently mean "since the dawn of time" anyway —
 * better to say so.
 *
 * Both figures are **personal bests**, never live streaks. A live figure would
 * move under the player mid-poll and turn a target into a distraction; a best
 * is a number to beat, and beating it is the whole point of stating it.
 */
export type CategoryRecord = {
	readonly category: CategoryCode;
	/** Absent while nobody clears the floor — the record is unclaimed. */
	readonly holder?: CategoryRecordHolder;
	readonly yourBest: number;
};

/**
 * Below this the category has no record holder, however well someone is doing.
 *
 * Two correct answers in a row is not evidence of anything, and a title that
 * cheap devalues every category that earned one honestly. The floor is what
 * makes `unclaimed` an invitation rather than an error state.
 */
export const MIN_RECORD_STREAK = 3;

export const isRecordStreak = (streak: number): boolean =>
	streak >= MIN_RECORD_STREAK;

/**
 * Holding a category's record makes you its maintainer. Derived from the
 * category rather than stored, so the title changes hands the moment the record
 * does — a stored title would outlive the thing it describes.
 */
export const maintainerTitleOf = (category: CategoryCode): string =>
	`${CATEGORY_METADATA[category].name} Maintainer`;

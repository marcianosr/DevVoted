/**
 * What the room and this account have done with a poll before.
 *
 * The room's figure is deliberately **first-attempt** accuracy: each player
 * counts once, on the deal taken before they were ever shown the answer. The
 * two alternatives both drift — a poll whose reveal has taught a thousand
 * people reads easier every month without the question changing — so a stored
 * "31%" would quietly stop meaning what it meant when it was written.
 *
 * Nothing here is persisted on the run snapshot. Like `RunPoll.missedBefore`,
 * it is attached when the sequence is read, because every one of these numbers
 * moves while the run is still open.
 */
export type PollStats = {
	/** Distinct players who have ever been dealt this poll and answered it. */
	readonly firstAttempts: number;
	/** How many of those got it fully right on that first answer. */
	readonly firstAttemptsRight: number;
	/** Times this account has answered it, across every run. */
	readonly attempts: number;
	/** How many of those were not fully right. A partial counts as a miss. */
	readonly misses: number;
	/** When this account last answered it. ISO date; absent if never. */
	readonly lastAnsweredAt?: string;
};

/**
 * Below this, the poll says `untested` rather than a percentage. Four players
 * getting it wrong is not evidence that a question is brutal, and a red badge
 * on that evidence is worse than no badge: it tells the player to spend a peek
 * they did not need.
 */
export const MIN_FIRST_ATTEMPTS = 5;

export type DifficultyBand = "untested" | "brutal" | "hard" | "fair" | "easy";

/** Floors, read downward: the first band whose floor the rate clears. */
const BAND_FLOORS = [
	{ floor: 80, band: "easy" },
	{ floor: 60, band: "fair" },
	{ floor: 35, band: "hard" },
	{ floor: 0, band: "brutal" },
] as const satisfies readonly { floor: number; band: DifficultyBand }[];

const PERCENT = 100;

export const firstAttemptRateOf = ({
	firstAttempts,
	firstAttemptsRight,
}: PollStats): number =>
	firstAttempts === 0
		? 0
		: Math.round((firstAttemptsRight / firstAttempts) * PERCENT);

export const isUntested = (stats: PollStats): boolean =>
	stats.firstAttempts < MIN_FIRST_ATTEMPTS;

export const difficultyBandOf = (stats: PollStats): DifficultyBand => {
	if (isUntested(stats)) return "untested";

	const rate = firstAttemptRateOf(stats);
	return BAND_FLOORS.find((entry) => rate >= entry.floor)?.band ?? "brutal";
};

/** This account has answered it before — the seen-before row's trigger. */
export const isSeenBefore = (stats: PollStats): boolean => stats.attempts > 0;

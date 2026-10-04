export type PollStats = {
	readonly firstAttempts: number;
	readonly firstAttemptsRight: number;
	readonly attempts: number;
	readonly misses: number;
	readonly lastAnsweredAt?: string;
};

export const MIN_FIRST_ATTEMPTS = 5;

export type DifficultyBand = "untested" | "brutal" | "hard" | "fair" | "easy";

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

export const isSeenBefore = (stats: PollStats): boolean => stats.attempts > 0;

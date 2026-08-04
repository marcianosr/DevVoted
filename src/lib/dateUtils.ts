import { format } from "date-fns";

export const getTodayDateString = () => {
	// return "2025-11-02";
	return format(new Date(), "yyyy-MM-dd");
};

/**
 * Milliseconds from `now` until the next daily poll opens.
 *
 * The daily poll is keyed on the local calendar date (see getTodayDateString),
 * so the next poll becomes available at the start of the next local day.
 *
 * setHours(24, 0, 0, 0) rolls cleanly into tomorrow (JS normalises hour 24 to
 * 00:00 of the next day), so the diff is the time left in the local day.
 */
export const getMsUntilNextPoll = (now: Date): number => {
	const nextMidnight = new Date(now);
	nextMidnight.setHours(24, 0, 0, 0);
	return nextMidnight.getTime() - now.getTime();
};

/**
 * Game-copy duration: "9s" under a minute, "1m45" past it. Hand-rolled on
 * purpose: Intl.DurationFormat's closest style is "1m 45s" and Temporal is
 * still Stage 3 (Firefox-only without a polyfill) — the exact compact copy is
 * a design choice, not a formatting gap. Floors at "1s": a standout can never
 * read "0s".
 */
export const formatDurationMs = (ms: number): string => {
	const seconds = Math.max(1, Math.round(ms / 1000));
	if (seconds < 60) return `${seconds}s`;
	return `${Math.floor(seconds / 60)}m${String(seconds % 60).padStart(2, "0")}`;
};

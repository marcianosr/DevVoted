import { format } from "date-fns";

export const getTodayDateString = () => format(new Date(), "yyyy-MM-dd");

/**
 * Milliseconds from `now` until the next daily poll opens.
 *
 * The daily poll is keyed on the local calendar date (see getTodayDateString),
 * so the next poll becomes available at the start of the next local day.
 *
 * setHours(24, 0, 0, 0) rolls cleanly into tomorrow (JS normalises hour 24 to
 * 00:00 of the next day), so the diff is the time left in the local day.
 */
export const nextLocalMidnight = (now: Date): Date => {
	const next = new Date(now);
	// setHours(24, …) normalises hour 24 to 00:00 of the next day.
	next.setHours(24, 0, 0, 0);
	return next;
};

export const getMsUntilNextPoll = (now: Date): number =>
	nextLocalMidnight(now).getTime() - now.getTime();

/**
 * Wait-copy duration: "7h 23m" / "2h" / "45m" / "<1m". Minute resolution on
 * purpose — it labels a button counting down to the next day, and a seconds
 * tick there reads as jitter, not information.
 */
export const formatCompactDuration = (ms: number): string => {
	const totalMinutes = Math.floor(Math.max(0, ms) / 60_000);
	if (totalMinutes < 1) return "<1m";
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours < 1) return `${minutes}m`;
	return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
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

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

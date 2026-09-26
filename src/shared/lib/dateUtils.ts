import { addDays, format } from "date-fns";

export const getTodayDateString = () => format(new Date(), "yyyy-MM-dd");

export const getTomorrowDateString = () =>
	format(addDays(new Date(), 1), "yyyy-MM-dd");

export const localDayRange = (date: string): { start: Date; end: Date } => {
	const start = new Date(`${date}T00:00:00`);
	const end = new Date(start);
	end.setDate(end.getDate() + 1);
	return { start, end };
};

export const nextLocalMidnight = (now: Date): Date => {
	const next = new Date(now);
	next.setHours(24, 0, 0, 0);
	return next;
};

export const getMsUntilNextPoll = (now: Date): number =>
	nextLocalMidnight(now).getTime() - now.getTime();

export const formatCompactDuration = (ms: number): string => {
	const totalMinutes = Math.floor(Math.max(0, ms) / 60_000);
	if (totalMinutes < 1) return "<1m";
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours < 1) return `${minutes}m`;
	return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
};

export const formatDurationMs = (ms: number): string => {
	const seconds = Math.max(1, Math.round(ms / 1000));
	if (seconds < 60) return `${seconds}s`;
	return `${Math.floor(seconds / 60)}m${String(seconds % 60).padStart(2, "0")}`;
};

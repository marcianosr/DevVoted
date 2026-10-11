import { addDays, format, subDays } from "date-fns";

export const getTodayDateString = () => format(new Date(), "yyyy-MM-dd");

export const getTomorrowDateString = () =>
	format(addDays(new Date(), 1), "yyyy-MM-dd");

export const dayBefore = (date: string): string =>
	format(subDays(new Date(`${date}T00:00:00`), 1), "yyyy-MM-dd");

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

export type ClockParts = {
	readonly main: string;
	readonly seconds: string;
};

const padTwo = (figure: number): string => String(figure).padStart(2, "0");

export const formatClock = (ms: number): ClockParts => {
	const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return {
		main: `${hours}h ${padTwo(minutes)}m`,
		seconds: `${padTwo(seconds)}s`,
	};
};

export const formatDurationMs = (ms: number): string => {
	const seconds = Math.max(1, Math.round(ms / 1000));
	if (seconds < 60) return `${seconds}s`;
	return `${Math.floor(seconds / 60)}m${String(seconds % 60).padStart(2, "0")}`;
};

const DAY_MS = 86_400_000;

const toGameDate = (moment: Date): string => moment.toISOString().slice(0, 10);

const startOfGameDay = (date: string): Date => new Date(`${date}T00:00:00Z`);

export const getTodayDateString = (): string => toGameDate(new Date());

export const dayBefore = (date: string): string =>
	toGameDate(new Date(startOfGameDay(date).getTime() - DAY_MS));

export const dayAfter = (date: string): string =>
	toGameDate(new Date(startOfGameDay(date).getTime() + DAY_MS));

export const gameDayRange = (date: string): { start: Date; end: Date } => {
	const start = startOfGameDay(date);
	return { start, end: new Date(start.getTime() + DAY_MS) };
};

export const nextGameDayStart = (now: Date): Date => {
	const next = new Date(now);
	next.setUTCHours(24, 0, 0, 0);
	return next;
};

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

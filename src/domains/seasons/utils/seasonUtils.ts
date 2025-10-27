import type { Season } from "../models/season";

export const calculateDaysRemaining = (endDate: Date): number => {
	const now = new Date();
	const end = new Date(endDate);
	const diffInMs = end.getTime() - now.getTime();
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
	return Math.max(0, diffInDays);
};

export const isSeasonActive = (season: Season): boolean => {
	const now = new Date();
	return season.status === "active" &&
		now >= season.startDate &&
		now <= season.endDate;
};

export const isSeasonExpired = (season: Season): boolean => {
	const now = new Date();
	return now > season.endDate;
};

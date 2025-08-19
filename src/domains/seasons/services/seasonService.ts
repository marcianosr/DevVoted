import type { Season } from "../models/season";
import * as seasonQueries from "../api/queries";

/**
 * Season Service
 *
 * Handles business logic for season management and lifecycle.
 * Provides high-level operations for season transitions and validation.
 */

export const getCurrentSeason = async (): Promise<Season | null> => {
	return await seasonQueries.findCurrentSeason();
};

export const getAllSeasons = async (): Promise<Season[]> => {
	return await seasonQueries.findAllSeasons();
};

export const getSeasonById = async (id: number): Promise<Season | null> => {
	return await seasonQueries.findSeasonById(id);
};

export const getActiveSeasons = async (): Promise<Season[]> => {
	return await seasonQueries.findActiveSeasons();
};

export const getUpcomingSeason = async (): Promise<Season | null> => {
	return await seasonQueries.findUpcomingSeason();
};

export const createSeason = async (seasonData: {
	name: string;
	description?: string;
	startDate: Date;
	endDate: Date;
}): Promise<Season> => {
	validateSeasonDates(seasonData.startDate, seasonData.endDate);

	const newSeason = await seasonQueries.insertSeason({
		name: seasonData.name,
		description: seasonData.description || null,
		status: "upcoming",
		start_date: seasonData.startDate,
		end_date: seasonData.endDate,
	});

	return newSeason;
};

export const startSeason = async (seasonId: number): Promise<Season | null> => {
	const season = await seasonQueries.findSeasonById(seasonId);

	if (!season) {
		return null;
	}

	if (season.status !== "upcoming") {
		throw new Error(
			`Cannot start season with status '${season.status}'. Only upcoming seasons can be started.`
		);
	}

	const now = new Date();
	if (now < season.startDate) {
		throw new Error("Cannot start season before its scheduled start date");
	}

	// Update season status to active
	return await seasonQueries.updateSeason(seasonId, { status: "active" });
};

export const finishSeason = async (
	seasonId: number
): Promise<Season | null> => {
	const season = await seasonQueries.findSeasonById(seasonId);

	if (!season) {
		return null;
	}

	if (season.status !== "active") {
		throw new Error(
			`Cannot finish season with status '${season.status}'. Only active seasons can be finished.`
		);
	}

	return await seasonQueries.updateSeason(seasonId, {
		status: "finished",
	});
};

export const archiveSeason = async (
	seasonId: number
): Promise<Season | null> => {
	const season = await seasonQueries.findSeasonById(seasonId);

	if (!season) {
		return null;
	}

	if (season.status !== "finished") {
		throw new Error(
			`Cannot archive season with status '${season.status}'. Only finished seasons can be archived.`
		);
	}

	// Update season status to archived
	return await seasonQueries.updateSeason(seasonId, { status: "archived" });
};

export const isSeasonActive = (season: Season): boolean => {
	const now = new Date();
	return (
		season.status === "active" &&
		season.startDate <= now &&
		season.endDate >= now
	);
};

export const isSeasonCurrent = (season: Season): boolean => {
	const now = new Date();
	return season.startDate <= now && season.endDate >= now;
};

export const getSeasonForNewRun = async (): Promise<number | null> => {
	const currentSeason = await getCurrentSeason();
	return currentSeason?.id || null;
};

const validateSeasonDates = (startDate: Date, endDate: Date): void => {
	if (startDate >= endDate) {
		throw new Error("Season start date must be before end date");
	}

	if (endDate <= new Date()) {
		throw new Error("Season end date must be in the future");
	}
};

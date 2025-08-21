import type { 
	LeaderboardEntry, 
	SeasonalLeaderboard,
	LeaderboardFilter 
} from "../models/leaderboard";
import * as leaderboardQueries from "../api/queries";
import * as seasonQueries from "~/domains/seasons/api/queries";

/**
 * Leaderboard Service
 * 
 * Handles business logic for leaderboard generation and season-aware ranking.
 * Provides unified access to various leaderboard types with season filtering.
 */

export const getGlobalLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
	return await leaderboardQueries.getTopRunsByTotalXp({ limit });
};

export const getCurrentSeasonLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
	// Get the current season ID
	const currentSeason = await seasonQueries.findCurrentSeason();
	return await leaderboardQueries.getTopRunsByTotalXp({ 
		seasonId: currentSeason?.id || null,
		limit 
	});
};

export const getSeasonLeaderboard = async (seasonId: number | null, limit: number = 10): Promise<SeasonalLeaderboard> => {
	const entries = await leaderboardQueries.getTopRunsByTotalXp({ seasonId, limit });
	
	let seasonName: string | null = null;
	if (seasonId) {
		const season = await seasonQueries.findSeasonById(seasonId);
		seasonName = season?.name || null;
	}
	
	return {
		seasonId,
		seasonName,
		entries,
	};
};


export const getStreakLeaderboard = async (filter: LeaderboardFilter = {}): Promise<LeaderboardEntry[]> => {
	return await leaderboardQueries.getTopStreaks(filter);
};

export const getPreSeasonLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
	return await leaderboardQueries.getTopRunsByTotalXp({ seasonId: null, limit });
};

export const getAvailableSeasons = async () => {
	return await seasonQueries.findAllSeasons();
};

export const getLeaderboardsForAllSeasons = async (limit: number = 10): Promise<SeasonalLeaderboard[]> => {
	const seasons = await seasonQueries.findAllSeasons();
	const leaderboards: SeasonalLeaderboard[] = await Promise.all(
		seasons.map(async (season) => {
			const entries = await leaderboardQueries.getTopRunsByTotalXp({ 
				seasonId: season.id, 
				limit 
			});
			return {
				seasonId: season.id,
				seasonName: season.name,
				entries,
			};
		})
	);

	// Add pre-season leaderboard
	const preSeasonEntries = await getPreSeasonLeaderboard(limit);
	leaderboards.unshift({
		seasonId: null,
		seasonName: "Pre-Season",
		entries: preSeasonEntries,
	});

	return leaderboards;
};
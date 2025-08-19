export type LeaderboardEntry = {
	userId: string;
	displayName: string;
	totalXp: number;
	bestStreak: number;
	pollsAnswered: number;
	runId: number;
	seasonId: number | null;
	categoryCode?: string;
};

export type CategoryLeaderboardEntry = LeaderboardEntry & {
	categoryCode: string;
	categoryXp: number;
};

export type LeaderboardFilter = {
	seasonId?: number | null;
	categoryCode?: string;
	limit?: number;
};

export type SeasonalLeaderboard = {
	seasonId: number | null;
	seasonName: string | null;
	entries: LeaderboardEntry[];
};

export type CategorySeasonalLeaderboard = {
	seasonId: number | null;
	seasonName: string | null;
	categoryCode: string;
	entries: CategoryLeaderboardEntry[];
};
export type LeaderboardEntry = {
	userId: string;
	displayName: string;
	totalXp: number;
	bestStreak: number;
	pollsAnswered: number;
	runId: number | null; // null when aggregating across multiple runs
	seasonId: number | null;
};

export type LeaderboardFilter = {
	seasonId?: number | null;
	limit?: number;
};

export type SeasonalLeaderboard = {
	seasonId: number | null;
	seasonName: string | null;
	entries: LeaderboardEntry[];
};
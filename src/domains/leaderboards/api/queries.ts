import { db } from "@/src/database/db";
import { leaderboardTable, usersTable, seasonsTable } from "@/src/database/schema";
import { eq, and, desc, isNull, max, sql } from "drizzle-orm";
import type { LeaderboardEntry, LeaderboardFilter } from "../models/leaderboard";
import type { CategoryCode } from "~/domains/shared/categories";

const buildCategoryCondition = (categoryCode?: CategoryCode) => 
	categoryCode ? [eq(leaderboardTable.category_code, categoryCode)] : [];

const buildSeasonCondition = (seasonId?: number | null) => {
	if (seasonId === undefined) return [];
	
	const condition = seasonId === null 
		? isNull(leaderboardTable.season_id)
		: eq(leaderboardTable.season_id, seasonId);
	
	return [condition];
};

const buildOrderColumn = (orderBy: 'total_xp' | 'best_streak' | 'category_xp') => ({
	'category_xp': sql`max_category_xp`,
	'best_streak': sql`max_best_streak`, 
	'total_xp': sql`max_total_xp`
}[orderBy]);

const buildLeaderboardQuery = (options: {
	seasonId?: number | null;
	categoryCode?: CategoryCode;
	limit: number;
	orderBy: 'total_xp' | 'best_streak' | 'category_xp';
}) => {
	const { seasonId, categoryCode, limit, orderBy } = options;
	
	const whereConditions = [
		...buildCategoryCondition(categoryCode),
		...buildSeasonCondition(seasonId)
	];

	const baseQuery = db
		.select({
			userId: leaderboardTable.user_id,
			displayName: usersTable.display_name,
			totalXp: max(leaderboardTable.total_xp).as('max_total_xp'),
			categoryXp: max(leaderboardTable.category_xp).as('max_category_xp'),
			bestStreak: max(leaderboardTable.best_streak).as('max_best_streak'),
			pollsAnswered: max(leaderboardTable.polls_answered).as('max_polls_answered'),
			seasonId: leaderboardTable.season_id,
		})
		.from(leaderboardTable)
		.innerJoin(usersTable, eq(leaderboardTable.user_id, usersTable.id))
		.where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
		.groupBy(leaderboardTable.user_id, usersTable.display_name, leaderboardTable.season_id);

	return baseQuery.orderBy(desc(buildOrderColumn(orderBy))).limit(limit);
};

export const getTopRunsByTotalXp = async (filter: LeaderboardFilter = {}): Promise<LeaderboardEntry[]> => {
	const { seasonId, categoryCode, limit = 10 } = filter;
	
	const results = await buildLeaderboardQuery({
		seasonId,
		categoryCode,
		limit,
		orderBy: 'total_xp'
	});
	
	return results.map((row) => ({
		userId: row.userId,
		displayName: row.displayName,
		totalXp: row.totalXp ?? 0,
		bestStreak: row.bestStreak ?? 0,
		pollsAnswered: row.pollsAnswered ?? 0,
		runId: null,
		seasonId: row.seasonId,
	}));
};


export const getTopStreaks = async (filter: LeaderboardFilter = {}): Promise<LeaderboardEntry[]> => {
	const { seasonId, categoryCode, limit = 10 } = filter;
	
	const results = await buildLeaderboardQuery({
		seasonId,
		categoryCode,
		limit,
		orderBy: 'best_streak'
	});
	
	return results.map((row) => ({
		userId: row.userId,
		displayName: row.displayName,
		totalXp: row.totalXp ?? 0,
		bestStreak: row.bestStreak ?? 0,
		pollsAnswered: row.pollsAnswered ?? 0,
		runId: null,
		seasonId: row.seasonId,
	}));
};

export const getCategoryLeaderboard = async (categoryCode: CategoryCode, filter: LeaderboardFilter = {}): Promise<LeaderboardEntry[]> => {
	const { seasonId, limit = 10 } = filter;
	
	const results = await buildLeaderboardQuery({
		seasonId,
		categoryCode,
		limit,
		orderBy: 'category_xp'
	});
	
	return results.map((row) => ({
		userId: row.userId,
		displayName: row.displayName,
		totalXp: row.categoryXp ?? 0, // Use category XP as the main metric for category leaderboards
		bestStreak: row.bestStreak ?? 0,
		pollsAnswered: row.pollsAnswered ?? 0,
		runId: null,
		seasonId: row.seasonId,
	}));
};


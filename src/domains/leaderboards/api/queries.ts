import { db } from "@/src/database/db";
import { leaderboardTable, usersTable, seasonsTable } from "@/src/database/schema";
import { eq, and, desc, isNull, max, sql } from "drizzle-orm";
import type { LeaderboardEntry, LeaderboardFilter } from "../models/leaderboard";

const buildLeaderboardQuery = (seasonId: number | null | undefined, limit: number) => {
	const baseQuery = db
		.select({
			userId: leaderboardTable.user_id,
			displayName: usersTable.display_name,
			totalXp: max(leaderboardTable.total_xp).as('max_total_xp'),
			bestStreak: max(leaderboardTable.best_streak).as('max_best_streak'),
			pollsAnswered: max(leaderboardTable.polls_answered).as('max_polls_answered'),
			seasonId: leaderboardTable.season_id,
		})
		.from(leaderboardTable)
		.innerJoin(usersTable, eq(leaderboardTable.user_id, usersTable.id))
		.groupBy(leaderboardTable.user_id, usersTable.display_name, leaderboardTable.season_id);

	if (seasonId === undefined) {
		return baseQuery.orderBy(desc(sql`max_total_xp`)).limit(limit);
	}
	
	if (seasonId === null) {
		return baseQuery
			.where(isNull(leaderboardTable.season_id))
			.orderBy(desc(sql`max_total_xp`))
			.limit(limit);
	}
	
	return baseQuery
		.where(eq(leaderboardTable.season_id, seasonId))
		.orderBy(desc(sql`max_total_xp`))
		.limit(limit);
};

export const getTopRunsByTotalXp = async (filter: LeaderboardFilter = {}): Promise<LeaderboardEntry[]> => {
	const { seasonId, limit = 10 } = filter;
	
	const results = await buildLeaderboardQuery(seasonId, limit);
	
	return results.map((row) => ({
		userId: row.userId,
		displayName: row.displayName,
		totalXp: row.totalXp ?? 0,
		bestStreak: row.bestStreak ?? 0,
		pollsAnswered: row.pollsAnswered ?? 0,
		runId: null, // No longer tracking individual runs since we aggregate
		seasonId: row.seasonId,
	}));
};


const buildStreakQuery = (seasonId: number | null | undefined, limit: number) => {
	const baseQuery = db
		.select({
			userId: leaderboardTable.user_id,
			displayName: usersTable.display_name,
			totalXp: max(leaderboardTable.total_xp).as('max_total_xp'),
			bestStreak: max(leaderboardTable.best_streak).as('max_best_streak'),
			pollsAnswered: max(leaderboardTable.polls_answered).as('max_polls_answered'),
			seasonId: leaderboardTable.season_id,
		})
		.from(leaderboardTable)
		.innerJoin(usersTable, eq(leaderboardTable.user_id, usersTable.id))
		.groupBy(leaderboardTable.user_id, usersTable.display_name, leaderboardTable.season_id);

	if (seasonId === undefined) {
		return baseQuery.orderBy(desc(sql`max_best_streak`)).limit(limit);
	}
	
	if (seasonId === null) {
		return baseQuery
			.where(isNull(leaderboardTable.season_id))
			.orderBy(desc(sql`max_best_streak`))
			.limit(limit);
	}
	
	return baseQuery
		.where(eq(leaderboardTable.season_id, seasonId))
		.orderBy(desc(sql`max_best_streak`))
		.limit(limit);
};

export const getTopStreaks = async (filter: LeaderboardFilter = {}): Promise<LeaderboardEntry[]> => {
	const { seasonId, limit = 10 } = filter;
	
	const results = await buildStreakQuery(seasonId, limit);
	
	return results.map((row) => ({
		userId: row.userId,
		displayName: row.displayName,
		totalXp: row.totalXp ?? 0,
		bestStreak: row.bestStreak ?? 0,
		pollsAnswered: row.pollsAnswered ?? 0,
		runId: null, // No longer tracking individual runs since we aggregate
		seasonId: row.seasonId,
	}));
};


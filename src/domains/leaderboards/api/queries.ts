import { db } from "@/src/database/db";
import { runsTable, runCategoryXpTable, usersTable, seasonsTable } from "@/src/database/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import type { LeaderboardEntry, CategoryLeaderboardEntry, LeaderboardFilter } from "../models/leaderboard";

export const getTopRunsByTotalXp = async (filter: LeaderboardFilter = {}): Promise<LeaderboardEntry[]> => {
	const { seasonId, limit = 10 } = filter;
	
	let baseQuery = db
		.select({
			userId: usersTable.id,
			displayName: usersTable.display_name,
			totalXp: sql<number>`SUM(COALESCE(${runCategoryXpTable.final_xp}, ${runCategoryXpTable.current_xp}))`,
			bestStreak: sql<number>`MAX(${runCategoryXpTable.best_streak})`,
			pollsAnswered: sql<number>`SUM(${runCategoryXpTable.polls_answered})`,
			runId: runsTable.id,
			seasonId: runsTable.season_id,
		})
		.from(runCategoryXpTable)
		.innerJoin(runsTable, eq(runCategoryXpTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.where(eq(runsTable.status, "finished"))
		.groupBy(usersTable.id, usersTable.display_name, runsTable.id, runsTable.season_id)
		.orderBy(desc(sql`SUM(COALESCE(${runCategoryXpTable.final_xp}, ${runCategoryXpTable.current_xp}))`))
		.limit(limit);

	// Apply season filter if specified
	// TODO: Fix Drizzle query builder chaining issue
	// if (seasonId !== undefined) {
	// 	if (seasonId === null) {
	// 		baseQuery = baseQuery.where(and(eq(runsTable.status, "finished"), isNull(runsTable.season_id)));
	// 	} else {
	// 		baseQuery = baseQuery.where(and(eq(runsTable.status, "finished"), eq(runsTable.season_id, seasonId)));
	// 	}
	// }

	const results = await baseQuery;
	
	return results.map((row) => ({
		userId: row.userId,
		displayName: row.displayName,
		totalXp: row.totalXp,
		bestStreak: row.bestStreak,
		pollsAnswered: row.pollsAnswered,
		runId: row.runId,
		seasonId: row.seasonId,
	}));
};

export const getTopRunsByCategory = async (
	categoryCode: string,
	filter: LeaderboardFilter = {}
): Promise<CategoryLeaderboardEntry[]> => {
	const { seasonId, limit = 10 } = filter;
	
	let baseQuery = db
		.select({
			userId: usersTable.id,
			displayName: usersTable.display_name,
			categoryXp: sql<number>`COALESCE(${runCategoryXpTable.final_xp}, ${runCategoryXpTable.current_xp})`,
			totalXp: sql<number>`SUM(COALESCE(${runCategoryXpTable.final_xp}, ${runCategoryXpTable.current_xp})) OVER (PARTITION BY ${runsTable.id})`,
			bestStreak: runCategoryXpTable.best_streak,
			pollsAnswered: runCategoryXpTable.polls_answered,
			runId: runsTable.id,
			seasonId: runsTable.season_id,
		})
		.from(runCategoryXpTable)
		.innerJoin(runsTable, eq(runCategoryXpTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.where(
			and(
				eq(runsTable.status, "finished"),
				eq(runCategoryXpTable.category_code, categoryCode)
			)
		)
		.orderBy(desc(sql`COALESCE(${runCategoryXpTable.final_xp}, ${runCategoryXpTable.current_xp})`))
		.limit(limit);

	// Apply season filter if specified
	if (seasonId !== undefined) {
		if (seasonId === null) {
			baseQuery = baseQuery.where(
				and(
					eq(runsTable.status, "finished"),
					eq(runCategoryXpTable.category_code, categoryCode),
					isNull(runsTable.season_id)
				)
			);
		} else {
			baseQuery = baseQuery.where(
				and(
					eq(runsTable.status, "finished"),
					eq(runCategoryXpTable.category_code, categoryCode),
					eq(runsTable.season_id, seasonId)
				)
			);
		}
	}

	const results = await baseQuery;
	
	return results.map((row) => ({
		userId: row.userId,
		displayName: row.displayName,
		totalXp: row.totalXp,
		categoryXp: row.categoryXp,
		bestStreak: row.bestStreak,
		pollsAnswered: row.pollsAnswered,
		runId: row.runId,
		seasonId: row.seasonId,
		categoryCode,
	}));
};

export const getTopStreaks = async (filter: LeaderboardFilter = {}): Promise<LeaderboardEntry[]> => {
	const { seasonId, limit = 10 } = filter;
	
	let baseQuery = db
		.select({
			userId: usersTable.id,
			displayName: usersTable.display_name,
			totalXp: sql<number>`SUM(COALESCE(${runCategoryXpTable.final_xp}, ${runCategoryXpTable.current_xp}))`,
			bestStreak: sql<number>`MAX(${runCategoryXpTable.best_streak})`,
			pollsAnswered: sql<number>`SUM(${runCategoryXpTable.polls_answered})`,
			runId: runsTable.id,
			seasonId: runsTable.season_id,
		})
		.from(runCategoryXpTable)
		.innerJoin(runsTable, eq(runCategoryXpTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.where(eq(runsTable.status, "finished"))
		.groupBy(usersTable.id, usersTable.display_name, runsTable.id, runsTable.season_id)
		.orderBy(desc(sql`MAX(${runCategoryXpTable.best_streak})`))
		.limit(limit);

	// Apply season filter if specified
	// TODO: Fix Drizzle query builder chaining issue
	// if (seasonId !== undefined) {
	// 	if (seasonId === null) {
	// 		baseQuery = baseQuery.where(and(eq(runsTable.status, "finished"), isNull(runsTable.season_id)));
	// 	} else {
	// 		baseQuery = baseQuery.where(and(eq(runsTable.status, "finished"), eq(runsTable.season_id, seasonId)));
	// 	}
	// }

	const results = await baseQuery;
	
	return results.map((row) => ({
		userId: row.userId,
		displayName: row.displayName,
		totalXp: row.totalXp,
		bestStreak: row.bestStreak,
		pollsAnswered: row.pollsAnswered,
		runId: row.runId,
		seasonId: row.seasonId,
	}));
};

export const getAllTimeLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
	return await getTopRunsByTotalXp({ limit });
};

export const getCurrentSeasonLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
	// Get the current season ID
	const { findCurrentSeason } = await import("~/domains/seasons/api/queries");
	const currentSeason = await findCurrentSeason();
	
	return await getTopRunsByTotalXp({ 
		seasonId: currentSeason?.id || null,
		limit 
	});
};
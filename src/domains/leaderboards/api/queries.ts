import { eq, and, desc, isNull, max, sql } from "drizzle-orm";

import { db } from "@/src/database/db";
import { leaderboardTable, usersTable } from "@/src/database/schema";
import type { CategoryCode } from "~/domains/shared/categories";

import type {
	LeaderboardEntry,
	LeaderboardFilter,
} from "../models/leaderboard";

const buildCategoryCondition = (categoryCode?: CategoryCode) =>
	categoryCode ? [eq(leaderboardTable.category_code, categoryCode)] : [];

const buildSeasonCondition = (seasonId?: number | null) => {
	if (seasonId === undefined) return [];

	const condition =
		seasonId === null
			? isNull(leaderboardTable.season_id)
			: eq(leaderboardTable.season_id, seasonId);

	return [condition];
};

const buildOrderColumn = (
	orderBy: "total_coverage" | "best_streak" | "category_coverage"
) =>
	({
		category_coverage: sql`max_category_coverage`,
		best_streak: sql`max_best_streak`,
		total_coverage: sql`max_total_coverage`,
	})[orderBy];

const buildLeaderboardQuery = (options: {
	seasonId?: number | null;
	categoryCode?: CategoryCode;
	limit: number;
	orderBy: "total_coverage" | "best_streak" | "category_coverage";
}) => {
	const { seasonId, categoryCode, limit, orderBy } = options;

	const whereConditions = [
		...buildCategoryCondition(categoryCode),
		...buildSeasonCondition(seasonId),
	];

	const baseQuery = db
		.select({
			userId: leaderboardTable.user_id,
			displayName: usersTable.display_name,
			totalCoverage: max(leaderboardTable.total_coverage).as(
				"max_total_coverage"
			),
			categoryCoverage: max(leaderboardTable.category_coverage).as(
				"max_category_coverage"
			),
			bestStreak: max(leaderboardTable.best_streak).as("max_best_streak"),
			pollsAnswered: max(leaderboardTable.polls_answered).as(
				"max_polls_answered"
			),
			seasonId: leaderboardTable.season_id,
		})
		.from(leaderboardTable)
		.innerJoin(usersTable, eq(leaderboardTable.user_id, usersTable.id))
		.where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
		.groupBy(
			leaderboardTable.user_id,
			usersTable.display_name,
			leaderboardTable.season_id
		);

	return baseQuery.orderBy(desc(buildOrderColumn(orderBy))).limit(limit);
};

export const getTopRunsByTotalCoverage = async (
	filter: LeaderboardFilter = {}
): Promise<LeaderboardEntry[]> => {
	const { seasonId, categoryCode, limit = 10 } = filter;

	const results = await buildLeaderboardQuery({
		seasonId,
		categoryCode,
		limit,
		orderBy: "total_coverage",
	});

	return results.map((row) => ({
		userId: row.userId,
		displayName: row.displayName,
		totalCoverage: row.totalCoverage ?? 0,
		bestStreak: row.bestStreak ?? 0,
		pollsAnswered: row.pollsAnswered ?? 0,
		runId: null,
		seasonId: row.seasonId,
	}));
};

export const getTopStreaks = async (
	filter: LeaderboardFilter = {}
): Promise<LeaderboardEntry[]> => {
	const { seasonId, categoryCode, limit = 10 } = filter;

	const results = await buildLeaderboardQuery({
		seasonId,
		categoryCode,
		limit,
		orderBy: "best_streak",
	});

	return results.map((row) => ({
		userId: row.userId,
		displayName: row.displayName,
		totalCoverage: row.totalCoverage ?? 0,
		bestStreak: row.bestStreak ?? 0,
		pollsAnswered: row.pollsAnswered ?? 0,
		runId: null,
		seasonId: row.seasonId,
	}));
};

export const getCategoryLeaderboard = async (
	categoryCode: CategoryCode,
	filter: LeaderboardFilter = {}
): Promise<LeaderboardEntry[]> => {
	const { seasonId, limit = 10 } = filter;

	const results = await buildLeaderboardQuery({
		seasonId,
		categoryCode,
		limit,
		orderBy: "category_coverage",
	});

	return results.map((row) => ({
		userId: row.userId,
		displayName: row.displayName,
		totalCoverage: row.categoryCoverage ?? 0, // Use category coverage as the main metric for category leaderboards
		bestStreak: row.bestStreak ?? 0,
		pollsAnswered: row.pollsAnswered ?? 0,
		runId: null,
		seasonId: row.seasonId,
	}));
};

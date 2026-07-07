import { eq, and, desc, sql } from "drizzle-orm";

import {
	runsTable,
	runCategoryCoverageTable,
	leaderboardTable,
	pollCategoriesTable,
	usersTable,
} from "@/src/database/schema";
import { db } from "~/database/db";
import type { CategoryCode } from "~/domains/shared/categories";

export const getLiveRunRankings = async (categoryCode?: CategoryCode) => {
	if (categoryCode) {
		return await db
			.select({
				userId: runsTable.user_id,
				displayName: usersTable.display_name,
				photoUrl: usersTable.photo_url,
				role: usersTable.role,
				runId: runsTable.id,
				seasonId: runsTable.season_id,
				totalCoverage: runCategoryCoverageTable.current_coverage,
				pollsAnswered: runCategoryCoverageTable.polls_answered,
				bestStreak: runCategoryCoverageTable.best_streak,
				correctPolls: runsTable.correct_polls_count,
				currentStreak: runCategoryCoverageTable.current_streak,
				pollsSeen: sql<number>`(
					SELECT COUNT(DISTINCT ph.poll_id)::int
					FROM polls_history ph
					WHERE ph.run_id = ${runsTable.id}
				)`,
			})
			.from(runsTable)
			.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
			.innerJoin(
				runCategoryCoverageTable,
				eq(runsTable.id, runCategoryCoverageTable.run_id)
			)
			.where(
				and(
					eq(runsTable.status, "active"),
					eq(runCategoryCoverageTable.category_code, categoryCode)
				)
			)
			.orderBy(desc(runCategoryCoverageTable.current_coverage))
			.limit(15);
	}

	return await db
		.select({
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			role: usersTable.role,
			runId: runsTable.id,
			seasonId: runsTable.season_id,
			totalCoverage: sql<number>`COALESCE(SUM(${runCategoryCoverageTable.current_coverage}), 0)`,
			pollsAnswered: sql<number>`COALESCE(SUM(${runCategoryCoverageTable.polls_answered}), 0)`,
			bestStreak: sql<number>`COALESCE(MAX(${runCategoryCoverageTable.best_streak}), 0)`,
			correctPolls: runsTable.correct_polls_count,
			currentStreak: runCategoryCoverageTable.current_streak,
			pollsSeen: sql<number>`(
				SELECT COUNT(DISTINCT ph.poll_id)::int
				FROM polls_history ph
				WHERE ph.run_id = ${runsTable.id}
			)`,
		})
		.from(runsTable)
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.leftJoin(
			runCategoryCoverageTable,
			eq(runsTable.id, runCategoryCoverageTable.run_id)
		)
		.where(eq(runsTable.status, "active"))
		.groupBy(
			runsTable.user_id,
			usersTable.display_name,
			runsTable.id,
			runsTable.season_id,
			runsTable.correct_polls_count
		)
		.orderBy(
			sql`COALESCE(SUM(${runCategoryCoverageTable.current_coverage}), 0) DESC`
		)
		.limit(20);
};

export const createCategoryLeaderboardEntries = async (
	userId: string,
	runId: number,
	seasonId: number | null,
	totalCoverage: number
) => {
	const allCategories = await db.select().from(pollCategoriesTable);

	const categoryCoverageRecords = await db
		.select()
		.from(runCategoryCoverageTable)
		.where(eq(runCategoryCoverageTable.run_id, runId));

	const categoryCoverageMap = new Map(
		categoryCoverageRecords.map((record) => [record.category_code, record])
	);

	const leaderboardEntries = [];

	for (const category of allCategories) {
		const categoryCoverage = categoryCoverageMap.get(category.code);

		const [leaderboardEntry] = await db
			.insert(leaderboardTable)
			.values({
				user_id: userId,
				run_id: runId,
				season_id: seasonId,
				category_code: category.code,
				category_coverage:
					categoryCoverage?.final_coverage ??
					categoryCoverage?.current_coverage ??
					0,
				total_coverage: totalCoverage,
				best_streak: categoryCoverage?.best_streak ?? 0,
				polls_answered: categoryCoverage?.polls_answered ?? 0,
				completed_at: new Date(),
			})
			.returning();

		leaderboardEntries.push(leaderboardEntry);
	}

	return leaderboardEntries;
};

export const getAllTimeHighestGate = async (): Promise<number> => {
	const result = await db
		.select({
			maxGate: sql<number>`coalesce(max(jsonb_array_length(${runsTable.pipeline_slot_snapshots}::jsonb)), 0)`,
		})
		.from(runsTable)
		.where(eq(runsTable.status, "finished"));

	return result[0]?.maxGate ?? 1;
};

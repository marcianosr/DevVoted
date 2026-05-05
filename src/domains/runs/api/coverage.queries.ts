import { eq, and, sql } from "drizzle-orm";

import { runCategoryCoverageTable, runsTable } from "@/src/database/schema";
import { db } from "~/database/db";
import type { CategoryCode } from "~/domains/shared/categories";

import { runCategoryCoverageFactory } from "../models/runCategoryCoverage.model";

export const awardCoverageToRun = async (
	runId: number,
	categoryCode: CategoryCode,
	newCoverage: number,
	newStreak: number,
	newBestStreak: number,
	newPollsAnswered: number
) => {
	return await db.transaction(async (tx) => {
		const [updatedRecord] = await tx
			.update(runCategoryCoverageTable)
			.set({
				current_coverage: newCoverage,
				current_streak: newStreak,
				best_streak: newBestStreak,
				polls_answered: newPollsAnswered,
			})
			.where(
				and(
					eq(runCategoryCoverageTable.run_id, runId),
					eq(runCategoryCoverageTable.category_code, categoryCode)
				)
			)
			.returning();

		return runCategoryCoverageFactory.toDTO(updatedRecord);
	});
};

export const incrementCorrectPollsCount = async (runId: number) => {
	await db
		.update(runsTable)
		.set({
			correct_polls_count: sql`${runsTable.correct_polls_count} + 1`,
		})
		.where(eq(runsTable.id, runId));
};

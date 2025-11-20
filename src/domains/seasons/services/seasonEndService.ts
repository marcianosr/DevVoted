import { eq, and } from "drizzle-orm";

import { db } from "~/database/db";
import { runsTable } from "~/database/schema";
import { endRunForThresholdFailure } from "~/domains/runs/services/runCompletion.service";

// Complete all active runs when a season ends
export const completeAllActiveRuns = async (seasonId: number) => {
	// Get all active runs for this season
	const activeRuns = await db
		.select()
		.from(runsTable)
		.where(
			and(eq(runsTable.season_id, seasonId), eq(runsTable.status, "active"))
		);

	const completionResults = [];

	// Complete each run with stats tracking and leaderboard entry
	for (const run of activeRuns) {
		try {
			const result = await endRunForThresholdFailure(run.id);
			completionResults.push({
				runId: run.id,
				userId: run.user_id,
				success: true,
				result,
			});
		} catch (error) {
			completionResults.push({
				runId: run.id,
				userId: run.user_id,
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	return {
		seasonId,
		totalActiveRuns: activeRuns.length,
		completedSuccessfully: completionResults.filter((r) => r.success).length,
		failedCompletions: completionResults.filter((r) => !r.success).length,
		results: completionResults,
	};
};

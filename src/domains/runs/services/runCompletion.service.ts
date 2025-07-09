import { db } from "~/database/db";
import { runsTable, runCategoryXpTable } from "~/database/schema";
import { eq } from "drizzle-orm";
import { updateUserPerformanceFromRun } from "./userPerformance.service";

export type RunCompletionResult = {
	readonly runEnded: boolean;
	readonly reason: string;
};

export const completeRunForThresholdFailure = async (
	runId: number
): Promise<RunCompletionResult> => {
	return await db.transaction(async (tx) => {
		// Get the run to find the user ID
		const [run] = await tx
			.select()
			.from(runsTable)
			.where(eq(runsTable.id, runId))
			.limit(1);

		if (!run) {
			throw new Error(`Run with ID ${runId} not found`);
		}

		// Update user performance records before resetting
		await updateUserPerformanceFromRun(runId, run.user_id);

		// Finish the run
		await tx
			.update(runsTable)
			.set({
				status: "finished",
				finished_at: new Date(),
			})
			.where(eq(runsTable.id, runId));

		// Reset all categories to 0
		await tx
			.update(runCategoryXpTable)
			.set({
				current_xp: 0,
				current_streak: 0,
				polls_answered: 0,
			})
			.where(eq(runCategoryXpTable.run_id, runId));

		return { runEnded: true, reason: "threshold_not_met" };
	});
};

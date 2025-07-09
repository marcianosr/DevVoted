import { db } from "~/database/db";
import {
	runCategoryXpTable,
	pollUserPerformanceTable,
} from "~/database/schema";
import { eq, and } from "drizzle-orm";

export const updateUserPerformanceFromRun = async (
	runId: number,
	userId: string
): Promise<void> => {
	return await db.transaction(async (tx) => {
		// Get current run category XP data
		const runCategoryXpRecords = await tx
			.select()
			.from(runCategoryXpTable)
			.where(eq(runCategoryXpTable.run_id, runId));

		// Update user performance records for each category
		for (const categoryXp of runCategoryXpRecords) {
			// Get existing user performance record for this category
			const [existingRecord] = await tx
				.select()
				.from(pollUserPerformanceTable)
				.where(
					and(
						eq(pollUserPerformanceTable.user_id, userId),
						eq(
							pollUserPerformanceTable.category_code,
							categoryXp.category_code
						)
					)
				)
				.limit(1);

			const newBestXp = Math.max(
				existingRecord?.best_xp || 0,
				categoryXp.current_xp
			);
			const newBestStreak = Math.max(
				existingRecord?.best_streak || 0,
				categoryXp.best_streak
			);

			if (existingRecord) {
				// Update existing record if we have new bests
				if (
					newBestXp > existingRecord.best_xp ||
					newBestStreak > existingRecord.best_streak
				) {
					await tx
						.update(pollUserPerformanceTable)
						.set({
							best_xp: newBestXp,
							best_streak: newBestStreak,
						})
						.where(
							eq(pollUserPerformanceTable.id, existingRecord.id)
						);
				}
			} else {
				// Create new record
				await tx.insert(pollUserPerformanceTable).values({
					user_id: userId,
					category_code: categoryXp.category_code,
					best_xp: categoryXp.current_xp,
					best_streak: categoryXp.best_streak,
				});
			}
		}
	});
};

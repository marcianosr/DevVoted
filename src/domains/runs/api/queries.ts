import { db } from "~/database/db";
import { runsTable, runCategoryXpTable, pollCategoriesTable } from "@/src/database/schema";
import { eq, and } from "drizzle-orm";
import { runFactory } from "../models/run";
import { runCategoryXpFactory } from "../models/runCategoryXp";

export const getActiveRunByUserId = async (userId: string) => {
	const runRecord = await db
		.select()
		.from(runsTable)
		.where(and(eq(runsTable.user_id, userId), eq(runsTable.status, "active")))
		.limit(1);
	
	return runRecord[0] ? runFactory.toDTO(runRecord[0]) : null;
};

export const createRunForUser = async (userId: string) => {
	return await db.transaction(async (tx) => {
		// Create the run
		const [runRecord] = await tx
			.insert(runsTable)
			.values({
				user_id: userId,
				status: "active",
			})
			.returning();
		
		// Get all categories
		const categories = await tx
			.select()
			.from(pollCategoriesTable);
		
		// Create XP records for each category
		const xpRecords = await Promise.all(
			categories.map(category => 
				tx.insert(runCategoryXpTable)
					.values({
						run_id: runRecord.id,
						category_code: category.code,
						current_xp: 0,
						current_streak: 0,
						best_streak: 0,
					})
					.returning()
			)
		);
		
		return {
			run: runFactory.toDTO(runRecord),
			categoryXp: xpRecords.flat().map(record => runCategoryXpFactory.toDTO(record)),
		};
	});
};

export const getRunWithCategoryXp = async (runId: number) => {
	const runRecord = await db
		.select()
		.from(runsTable)
		.where(eq(runsTable.id, runId))
		.limit(1);
	
	if (!runRecord[0]) {
		return null;
	}
	
	const xpRecords = await db
		.select()
		.from(runCategoryXpTable)
		.where(eq(runCategoryXpTable.run_id, runId));
	
	return {
		run: runFactory.toDTO(runRecord[0]),
		categoryXp: xpRecords.map(record => runCategoryXpFactory.toDTO(record)),
	};
};

export const finishRun = async (runId: number) => {
	const [runRecord] = await db
		.update(runsTable)
		.set({
			status: "finished",
			finished_at: new Date(),
		})
		.where(eq(runsTable.id, runId))
		.returning();
	
	return runRecord ? runFactory.toDTO(runRecord) : null;
};
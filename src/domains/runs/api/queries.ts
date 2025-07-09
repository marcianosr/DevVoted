import { db } from "~/database/db";
import {
	runsTable,
	runCategoryXpTable,
	pollCategoriesTable,
	pollUserPerformanceTable,
} from "@/src/database/schema";
import { eq, and } from "drizzle-orm";
import { runFactory } from "../models/run";
import { runCategoryXpFactory } from "../models/runCategoryXp";
import { XP_AWARDS } from "~/domains/userPerformance/constants/xpSystem";
import {
	calculateThresholdInfo,
	calculateNextPollThresholdFromCategoryData,
	type ThresholdInfo,
} from "~/domains/userPerformance/services/thresholdCalculator.service";

export const getActiveRunByUserId = async (userId: string) => {
	const runRecord = await db
		.select()
		.from(runsTable)
		.where(
			and(eq(runsTable.user_id, userId), eq(runsTable.status, "active"))
		)
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
		const categories = await tx.select().from(pollCategoriesTable);

		// Create XP records for each category
		const xpRecords = await Promise.all(
			categories.map((category) =>
				tx
					.insert(runCategoryXpTable)
					.values({
						run_id: runRecord.id,
						category_code: category.code,
						current_xp: 0,
						current_streak: 0,
						best_streak: 0,
						polls_answered: 0,
					})
					.returning()
			)
		);

		return {
			run: runFactory.toDTO(runRecord),
			categoryXp: xpRecords
				.flat()
				.map((record) => runCategoryXpFactory.toDTO(record)),
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
		categoryXp: xpRecords.map((record) =>
			runCategoryXpFactory.toDTO(record)
		),
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

// Helper function to calculate total XP across all categories in a run
export const getTotalXpForRun = async (runId: number): Promise<number> => {
	const xpRecords = await db
		.select()
		.from(runCategoryXpTable)
		.where(eq(runCategoryXpTable.run_id, runId));

	return xpRecords.reduce((total, record) => total + record.current_xp, 0);
};

// Helper function to get the highest streak across all categories (global poll number)
export const getGlobalStreakForRun = async (runId: number): Promise<number> => {
	const xpRecords = await db
		.select()
		.from(runCategoryXpTable)
		.where(eq(runCategoryXpTable.run_id, runId));

	return Math.max(...xpRecords.map((record) => record.current_streak), 0);
};

// Helper function to get the total polls answered across all categories
export const getTotalPollsAnsweredForRun = async (
	runId: number
): Promise<number> => {
	const xpRecords = await db
		.select()
		.from(runCategoryXpTable)
		.where(eq(runCategoryXpTable.run_id, runId));

	return xpRecords.reduce(
		(total, record) => total + record.polls_answered,
		0
	);
};

// Helper function to check if run meets XP threshold to continue
export const checkXpThreshold = async (
	runId: number
): Promise<ThresholdInfo> => {
	const totalXp = await getTotalXpForRun(runId);
	const totalPollsAnswered = await getTotalPollsAnsweredForRun(runId);

	return calculateThresholdInfo(totalXp, totalPollsAnswered);
};

// Helper function to get current threshold info for display (sync version using run data)
export const getCurrentThresholdInfo = (
	categoryXp: { currentXp: number; pollsAnswered: number }[]
): ThresholdInfo => {
	const categoryData = categoryXp.map((xp) => ({
		currentXp: xp.currentXp,
		pollsAnswered: xp.pollsAnswered,
	}));

	return calculateNextPollThresholdFromCategoryData(categoryData);
};

export const awardXpToRun = async (
	runId: number,
	categoryCode: string,
	xpAmount: number = XP_AWARDS.CORRECT_ANSWER
) => {
	return await db.transaction(async (tx) => {
		// Get current XP record for this run and category
		const [currentXp] = await tx
			.select()
			.from(runCategoryXpTable)
			.where(
				and(
					eq(runCategoryXpTable.run_id, runId),
					eq(runCategoryXpTable.category_code, categoryCode)
				)
			)
			.limit(1);

		if (!currentXp) {
			throw new Error(
				`No XP record found for run ${runId} and category ${categoryCode}`
			);
		}

		// Calculate new values
		const newXp = currentXp.current_xp + xpAmount;
		const newStreak =
			xpAmount > 0
				? currentXp.current_streak + 1
				: currentXp.current_streak;
		const newBestStreak = Math.max(currentXp.best_streak, newStreak);
		const newPollsAnswered = currentXp.polls_answered + 1;

		// Update the XP record
		const [updatedRecord] = await tx
			.update(runCategoryXpTable)
			.set({
				current_xp: newXp,
				current_streak: newStreak,
				best_streak: newBestStreak,
				polls_answered: newPollsAnswered,
			})
			.where(
				and(
					eq(runCategoryXpTable.run_id, runId),
					eq(runCategoryXpTable.category_code, categoryCode)
				)
			)
			.returning();

		return runCategoryXpFactory.toDTO(updatedRecord);
	});
};

export const penalizeXpInRun = async (runId: number, categoryCode: string) => {
	return await db.transaction(async (tx) => {
		// Reset XP and streak to 0 for the wrong answer category
		const [updatedRecord] = await tx
			.update(runCategoryXpTable)
			.set({
				current_xp: 0,
				current_streak: 0,
			})
			.where(
				and(
					eq(runCategoryXpTable.run_id, runId),
					eq(runCategoryXpTable.category_code, categoryCode)
				)
			)
			.returning();

		if (!updatedRecord) {
			throw new Error(
				`No XP record found for run ${runId} and category ${categoryCode}`
			);
		}

		// Since any category hitting 0 ends the run, finish it and reset all categories
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
			})
			.where(eq(runCategoryXpTable.run_id, runId));

		return { runEnded: true };
	});
};

// Helper function to update user performance records with current run data
export const updateUserPerformanceRecords = async (
	runId: number,
	userId: string
) => {
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

// End run when XP threshold is not met
export const endRunForThresholdFailure = async (runId: number) => {
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
		await updateUserPerformanceRecords(runId, run.user_id);

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

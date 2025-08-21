import { db } from "~/database/db";
import {
	runsTable,
	runCategoryXpTable,
	pollCategoriesTable,
	leaderboardTable,
} from "@/src/database/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { runFactory } from "../models/run";
import { runCategoryXpFactory } from "../models/runCategoryXp";
import {
	calculateStreakUpdate,
	calculateBestStreak,
	calculateRunXP,
} from "~/domains/score/services/score.service";

export const getActiveRunByUserId = async (userId: string) => {
	const runRecord = await db
		.select()
		.from(runsTable)
		.where(
			and(eq(runsTable.user_id, userId), eq(runsTable.status, "active"))
		)
		.limit(1);

	if (!runRecord[0]) {
		return null;
	}

	const xpRecords = await db
		.select()
		.from(runCategoryXpTable)
		.where(eq(runCategoryXpTable.run_id, runRecord[0].id));

	const categoryXp = xpRecords.map((record) =>
		runCategoryXpFactory.toDTO(record)
	);

	return runFactory.toDTO(runRecord[0], categoryXp);
};

export const createRunForUser = async (userId: string) => {
	return await db.transaction(async (tx) => {
		// Get current season ID for the new run
		const { getSeasonForNewRun } = await import(
			"~/domains/seasons/services/seasonService"
		);
		const seasonId = await getSeasonForNewRun();

		const [runRecord] = await tx
			.insert(runsTable)
			.values({
				user_id: userId,
				season_id: seasonId,
				status: "active",
			})
			.returning();

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

		const categoryXp = xpRecords
			.flat()
			.map((record) => runCategoryXpFactory.toDTO(record));

		return runFactory.toDTO(runRecord, categoryXp);
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

	const categoryXp = xpRecords.map((record) =>
		runCategoryXpFactory.toDTO(record)
	);

	return runFactory.toDTO(runRecord[0], categoryXp);
};

// Basic run completion - only sets status and timestamp (no stats processing)
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

// Helper function to get the best streak across all categories in a run
export const getBestStreakForRun = async (runId: number): Promise<number> => {
	const xpRecords = await db
		.select()
		.from(runCategoryXpTable)
		.where(eq(runCategoryXpTable.run_id, runId));

	return xpRecords.reduce(
		(maxStreak, record) => Math.max(maxStreak, record.best_streak),
		0
	);
};

// Create category-specific leaderboard entries for a completed run
export const createCategoryLeaderboardEntries = async (
	userId: string,
	runId: number,
	seasonId: number | null,
	totalXp: number,
	totalPollsAnswered: number,
	overallBestStreak: number
) => {
	// Get ALL categories from database
	const allCategories = await db.select().from(pollCategoriesTable);

	// Get category-specific XP data for this run
	const categoryXpRecords = await db
		.select()
		.from(runCategoryXpTable)
		.where(eq(runCategoryXpTable.run_id, runId));

	// Create a map for quick lookup
	const categoryXpMap = new Map(
		categoryXpRecords.map((record) => [record.category_code, record])
	);

	const leaderboardEntries = [];

	// Create one leaderboard entry per category (whether or not they have XP records)
	for (const category of allCategories) {
		const categoryXp = categoryXpMap.get(category.code);

		const [leaderboardEntry] = await db
			.insert(leaderboardTable)
			.values({
				user_id: userId,
				run_id: runId,
				season_id: seasonId,
				category_code: category.code,
				category_xp:
					categoryXp?.final_xp ?? categoryXp?.current_xp ?? 0, // Use final_xp after threshold failure, current_xp otherwise
				total_xp: totalXp,
				best_streak: categoryXp?.best_streak ?? 0,
				polls_answered: categoryXp?.polls_answered ?? 0,
				completed_at: new Date(),
			})
			.returning();

		leaderboardEntries.push(leaderboardEntry);
	}

	return leaderboardEntries;
};

export const awardXpToRun = async (
	runId: number,
	categoryCode: string,
	baseXpFromCorrectness: number
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

		const newXp = currentXp.current_xp + baseXpFromCorrectness;
		const newStreak = calculateStreakUpdate(
			currentXp.current_streak,
			baseXpFromCorrectness
		);
		const newBestStreak = calculateBestStreak(
			currentXp.best_streak,
			newStreak
		);
		const newPollsAnswered = currentXp.polls_answered + 1;

		const totalXp = calculateRunXP(newPollsAnswered, newStreak);

		console.log("total", totalXp);

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

// Get run for completion processing
export const getRunForCompletion = async (runId: number) => {
	const [run] = await db
		.select()
		.from(runsTable)
		.where(eq(runsTable.id, runId))
		.limit(1);

	return run;
};

export const getLastRunFromUser = async (userId: string) => {
	const lastRunRecord = await db
		.select()
		.from(runsTable)
		.where(
			and(eq(runsTable.user_id, userId), eq(runsTable.status, "finished"))
		)
		.orderBy(desc(runsTable.finished_at))
		.limit(1);

	if (!lastRunRecord[0]) {
		return null;
	}

	const xpRecords = await db
		.select({
			categoryCode: runCategoryXpTable.category_code,
			currentXp: sql<number>`COALESCE(${runCategoryXpTable.final_xp}, ${runCategoryXpTable.current_xp})`,
			currentStreak: sql<number>`COALESCE(${runCategoryXpTable.final_streak}, ${runCategoryXpTable.current_streak})`,
			bestStreak: runCategoryXpTable.best_streak,
			pollsAnswered: runCategoryXpTable.polls_answered,
		})
		.from(runCategoryXpTable)
		.where(eq(runCategoryXpTable.run_id, lastRunRecord[0].id));

	return {
		run: lastRunRecord[0],
		categoryXp: xpRecords,
		totalXp: xpRecords.reduce((sum, xp) => sum + xp.currentXp, 0),
		totalPollsAnswered: xpRecords.reduce(
			(sum, xp) => sum + xp.pollsAnswered,
			0
		),
	};
};

// Complete run due to threshold failure - preserves progress in final_* columns then resets current values
export const completeRunWithThresholdFailure = async (runId: number) => {
	return await db.transaction(async (tx) => {
		// Store current values in final columns before resetting
		await tx
			.update(runCategoryXpTable)
			.set({
				final_xp: sql`current_xp`,
				final_streak: sql`current_streak`,
			})
			.where(eq(runCategoryXpTable.run_id, runId));

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
	});
};

// Add configs to a run's storage deck
export const addConfigsToRun = async (runId: number, configIds: string[]) => {
	const [runRecord] = await db
		.select()
		.from(runsTable)
		.where(eq(runsTable.id, runId))
		.limit(1);

	if (!runRecord) {
		throw new Error(`Run with id ${runId} not found`);
	}

	const currentConfigIds = runRecord.active_config_ids || [];
	const updatedConfigIds = [...new Set([...currentConfigIds, ...configIds])];

	const [updatedRun] = await db
		.update(runsTable)
		.set({
			active_config_ids: updatedConfigIds,
		})
		.where(eq(runsTable.id, runId))
		.returning();

	// Get the run with its category XP data
	const xpRecords = await db
		.select()
		.from(runCategoryXpTable)
		.where(eq(runCategoryXpTable.run_id, runId));

	const categoryXp = xpRecords.map((record) =>
		runCategoryXpFactory.toDTO(record)
	);

	return runFactory.toDTO(updatedRun, categoryXp);
};

// Reset current poll rerolls to 0 (called after poll submission)
export const resetPollRerolls = async (runId: number) => {
	const [updatedRun] = await db
		.update(runsTable)
		.set({
			rerolls: 0,
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return updatedRun ? runFactory.toDTO(updatedRun) : null;
};

// Process reroll shop request
export const processRerollShop = async (runId: number) => {
	return await db.transaction(async (tx) => {
		// Get the current run
		const [runRecord] = await tx
			.select()
			.from(runsTable)
			.where(eq(runsTable.id, runId))
			.limit(1);

		if (!runRecord) {
			throw new Error("Run not found");
		}

		// TODO: Should we import it like this?
		// Calculate the cost of this specific reroll
		const { calculateRerollCost } = await import(
			"~/domains/economy/services/reroll.service"
		);
		const rerollCost = calculateRerollCost(runRecord.rerolls);

		// Update the run with incremented reroll counts and storage used
		const [updatedRun] = await tx
			.update(runsTable)
			.set({
				rerolls: runRecord.rerolls + 1,
				total_rerolls: runRecord.total_rerolls + 1,
				reroll_storage_used: runRecord.reroll_storage_used + rerollCost,
			})
			.where(eq(runsTable.id, runId))
			.returning();

		return {
			originalRun: runFactory.toDTO(runRecord),
			updatedRun: runFactory.toDTO(updatedRun),
		};
	});
};

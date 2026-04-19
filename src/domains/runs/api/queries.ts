import { eq, and, desc, sql } from "drizzle-orm";

import {
	runsTable,
	runCategoryCoverageTable,
	pollCategoriesTable,
	leaderboardTable,
	usersTable,
} from "@/src/database/schema";
import { db } from "~/database/db";
import type { CategoryCode } from "~/domains/shared/categories";
import { getInitialPipelineSlots } from "~/domains/runs/services/pipeline.service";
import type { PipelineSlot, UpgradeCard } from "~/domains/runs/models/pipeline";

import { runFactory } from "../models/run";
import { runCategoryCoverageFactory } from "../models/runCategoryCoverage";

export type ExposedConfigDeck = {
	userId: string;
	displayName: string;
	photoUrl: string | null;
	configIds: string[];
	runId: number;
};

export const getActiveRunByUserId = async (userId: string) => {
	const runRecord = await db
		.select()
		.from(runsTable)
		.where(and(eq(runsTable.user_id, userId), eq(runsTable.status, "active")))
		.limit(1);

	if (!runRecord[0]) {
		return null;
	}

	const coverageRecords = await db
		.select()
		.from(runCategoryCoverageTable)
		.where(eq(runCategoryCoverageTable.run_id, runRecord[0].id));

	const categoryCoverage = coverageRecords.map((record) =>
		runCategoryCoverageFactory.toDTO(record)
	);

	return runFactory.toDTO(runRecord[0], categoryCoverage);
};

export const createRunForUser = async (userId: string) => {
	return await db.transaction(async (tx) => {
		// Get current season ID for the new run
		const { getSeasonForNewRun } =
			await import("~/domains/seasons/services/seasonService");
		const seasonId = await getSeasonForNewRun();

		const [runRecord] = await tx
			.insert(runsTable)
			.values({
				user_id: userId,
				season_id: seasonId,
				status: "active",
				pipeline_slots: getInitialPipelineSlots(),
			})
			.returning();

		const categories = await tx.select().from(pollCategoriesTable);

		// Create coverage records for each category
		const coverageRecords = await Promise.all(
			categories.map((category) =>
				tx
					.insert(runCategoryCoverageTable)
					.values({
						run_id: runRecord.id,
						category_code: category.code,
						current_coverage: 0,
						current_streak: 0,
						best_streak: 0,
						polls_answered: 0,
					})
					.returning()
			)
		);

		const categoryCoverage = coverageRecords
			.flat()
			.map((record) => runCategoryCoverageFactory.toDTO(record));

		return runFactory.toDTO(runRecord, categoryCoverage);
	});
};

export const getRunWithCategoryCoverage = async (runId: number) => {
	const runRecord = await db
		.select()
		.from(runsTable)
		.where(eq(runsTable.id, runId))
		.limit(1);

	if (!runRecord[0]) {
		return null;
	}

	const coverageRecords = await db
		.select()
		.from(runCategoryCoverageTable)
		.where(eq(runCategoryCoverageTable.run_id, runId));

	const categoryCoverage = coverageRecords.map((record) =>
		runCategoryCoverageFactory.toDTO(record)
	);

	return runFactory.toDTO(runRecord[0], categoryCoverage);
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

// Mark victory achieved without ending the run (post-victory mode)
export const markVictoryAchieved = async (runId: number) => {
	const [runRecord] = await db
		.update(runsTable)
		.set({
			victory_achieved_at: new Date(),
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return runRecord ? runFactory.toDTO(runRecord) : null;
};

export const getRunStats = async (runId: number) => {
	const stats = await db
		.select()
		.from(runCategoryCoverageTable)
		.where(eq(runCategoryCoverageTable.run_id, runId));

	return {
		totalCoverage: stats.reduce(
			(total, record) => total + record.current_coverage,
			0
		),
		totalPollsAnswered: stats.reduce(
			(total, record) => total + record.polls_answered,
			0
		),
		bestStreak: stats.reduce(
			(maxStreak, record) => Math.max(maxStreak, record.best_streak),
			0
		),
	};
};

export const getAllRuns = () => {
	const runs = db.select().from(runsTable).orderBy(desc(runsTable.created_at));
	return runs;
};

// Create category-specific leaderboard entries for a completed run
export const createCategoryLeaderboardEntries = async (
	userId: string,
	runId: number,
	seasonId: number | null,
	totalCoverage: number
) => {
	// Get ALL categories from database
	const allCategories = await db.select().from(pollCategoriesTable);

	// Get category-specific coverage data for this run
	const categoryCoverageRecords = await db
		.select()
		.from(runCategoryCoverageTable)
		.where(eq(runCategoryCoverageTable.run_id, runId));

	// Create a map for quick lookup
	const categoryCoverageMap = new Map(
		categoryCoverageRecords.map((record) => [record.category_code, record])
	);

	const leaderboardEntries = [];

	// Create one leaderboard entry per category (whether or not they have coverage records)
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
					0, // Use final_coverage after threshold failure, current_coverage otherwise
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

export const awardCoverageToRun = async (
	runId: number,
	categoryCode: CategoryCode,
	newCoverage: number,
	newStreak: number,
	newBestStreak: number,
	newPollsAnswered: number
) => {
	return await db.transaction(async (tx) => {
		// Update the coverage record with pre-calculated values
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

/**
 * Increments the correct polls count for a run.
 * Called when a player answers a poll with "full" outcome (completely correct).
 */
export const incrementCorrectPollsCount = async (runId: number) => {
	await db
		.update(runsTable)
		.set({
			correct_polls_count: sql`${runsTable.correct_polls_count} + 1`,
		})
		.where(eq(runsTable.id, runId));
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
		.where(and(eq(runsTable.user_id, userId), eq(runsTable.status, "finished")))
		.orderBy(desc(runsTable.finished_at))
		.limit(1);

	if (!lastRunRecord[0]) {
		return null;
	}

	const coverageRecords = await db
		.select({
			categoryCode: runCategoryCoverageTable.category_code,
			currentCoverage: sql<number>`COALESCE(${runCategoryCoverageTable.final_coverage}, ${runCategoryCoverageTable.current_coverage})`,
			currentStreak: sql<number>`COALESCE(${runCategoryCoverageTable.final_streak}, ${runCategoryCoverageTable.current_streak})`,
			bestStreak: runCategoryCoverageTable.best_streak,
			pollsAnswered: sql<number>`COALESCE(${runCategoryCoverageTable.final_polls_answered}, ${runCategoryCoverageTable.polls_answered})`,
		})
		.from(runCategoryCoverageTable)
		.where(eq(runCategoryCoverageTable.run_id, lastRunRecord[0].id));

	return {
		run: lastRunRecord[0],
		categoryCoverage: coverageRecords.map((coverage) => ({
			...coverage,
			categoryCode: coverage.categoryCode as CategoryCode,
		})),
		totalCoverage: coverageRecords.reduce(
			(sum, coverage) => sum + coverage.currentCoverage,
			0
		),
		totalPollsAnswered: coverageRecords.reduce(
			(sum, coverage) => sum + coverage.pollsAnswered,
			0
		),
	};
};

// Complete run due to threshold failure - preserves progress in final_* columns then resets current values
export const completeRunWithThresholdFailure = async (
	runId: number,
	reason: string
) => {
	return await db.transaction(async (tx) => {
		// Store current values in final columns before resetting
		await tx
			.update(runCategoryCoverageTable)
			.set({
				final_coverage: sql`current_coverage`,
				final_streak: sql`current_streak`,
				final_polls_answered: sql`polls_answered`,
			})
			.where(eq(runCategoryCoverageTable.run_id, runId));

		// Finish the run with reason
		await tx
			.update(runsTable)
			.set({
				status: "finished",
				finished_at: new Date(),
				completion_reason: reason,
			})
			.where(eq(runsTable.id, runId));

		// Reset all categories to 0
		await tx
			.update(runCategoryCoverageTable)
			.set({
				current_coverage: 0,
				current_streak: 0,
				polls_answered: 0,
			})
			.where(eq(runCategoryCoverageTable.run_id, runId));
	});
};

// Add configs to a run's config deck
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
	const coverageRecords = await db
		.select()
		.from(runCategoryCoverageTable)
		.where(eq(runCategoryCoverageTable.run_id, runId));

	const categoryCoverage = coverageRecords.map((record) =>
		runCategoryCoverageFactory.toDTO(record)
	);

	return runFactory.toDTO(updatedRun, categoryCoverage);
};

export const awardStorage = async (
	runId: number,
	amount: number
): Promise<void> => {
	await db
		.update(runsTable)
		.set({
			storage_limit: sql`${runsTable.storage_limit} + ${amount}`,
		})
		.where(eq(runsTable.id, runId));
};

export const savePendingUpgradeCards = async (
	runId: number,
	cards: UpgradeCard[]
): Promise<void> => {
	await db
		.update(runsTable)
		.set({ pending_upgrade_cards: cards })
		.where(eq(runsTable.id, runId));
};

export const clearPendingUpgradeCards = async (
	runId: number
): Promise<void> => {
	await db
		.update(runsTable)
		.set({ pending_upgrade_cards: [] })
		.where(eq(runsTable.id, runId));
};

export const savePipelineSlots = async (
	runId: number,
	slots: PipelineSlot[]
) => {
	const [updatedRun] = await db
		.update(runsTable)
		.set({ pipeline_slots: slots })
		.where(eq(runsTable.id, runId))
		.returning();

	return updatedRun ? runFactory.toDTO(updatedRun) : null;
};

export const appendPipelineSlotSnapshot = async (
	runId: number,
	snapshot: PipelineSlot[]
): Promise<void> => {
	await db.execute(
		sql`UPDATE ${runsTable}
		    SET pipeline_slot_snapshots = pipeline_slot_snapshots || ${JSON.stringify([snapshot])}::jsonb
		    WHERE ${runsTable.id} = ${runId}`
	);
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

// Get live rankings for active runs, optionally filtered by category
export const getLiveRunRankings = async (categoryCode?: CategoryCode) => {
	if (categoryCode) {
		// Get category-specific live rankings
		const categoryRankings = await db
			.select({
				userId: runsTable.user_id,
				displayName: usersTable.display_name,
				photoUrl: usersTable.photo_url,
				role: usersTable.role,
				runId: runsTable.id,
				seasonId: runsTable.season_id,

				totalCoverage: runCategoryCoverageTable.current_coverage, // Category coverage only
				pollsAnswered: runCategoryCoverageTable.polls_answered, // Category polls only
				bestStreak: runCategoryCoverageTable.best_streak, // Category streak only
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
			.limit(15); // Top 15 for category

		return categoryRankings;
	} else {
		// Get overall live rankings (total coverage across all categories)
		const activeRuns = await db
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
			.limit(20); // Top 20 overall

		return activeRuns;
	}
};

// Skip shop and grant storage bonus
export const skipShop = async (
	runId: number,
	date: string,
	storageBonus: number = 0
) => {
	const SKIP_REWARD = 64 * 1024; // 64KB in bytes
	const totalReward = SKIP_REWARD + storageBonus;

	return await db.transaction(async (tx) => {
		const [updatedRun] = await tx
			.update(runsTable)
			.set({
				storage_limit: sql`${runsTable.storage_limit} + ${totalReward}`,
				shop_skipped_date: date,
			})
			.where(eq(runsTable.id, runId))
			.returning();

		const coverageRecords = await tx
			.select()
			.from(runCategoryCoverageTable)
			.where(eq(runCategoryCoverageTable.run_id, runId));

		const categoryCoverage = coverageRecords.map((record) =>
			runCategoryCoverageFactory.toDTO(record)
		);

		return runFactory.toDTO(updatedRun, categoryCoverage);
	});
};

/**
 * Get all active config IDs across all active runs.
 * Used for calculating global category weights for daily poll selection.
 * Each active run contributes its configs to the global weight pool.
 */
export const getAllActiveConfigIds = async (): Promise<string[]> => {
	const activeRuns = await db
		.select({ activeConfigIds: runsTable.active_config_ids })
		.from(runsTable)
		.where(eq(runsTable.status, "active"));

	return activeRuns.flatMap((run) => run.activeConfigIds);
};

// Process reroll shop request
export const processRerollShop = async (runId: number, date?: string) => {
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
		const { calculateRerollCost } =
			await import("~/domains/economy/services/reroll.service");
		const rerollCost = calculateRerollCost(runRecord.rerolls);

		// Update the run with incremented reroll counts and storage used
		const [updatedRun] = await tx
			.update(runsTable)
			.set({
				rerolls: runRecord.rerolls + 1,
				total_rerolls: runRecord.total_rerolls + 1,
				reroll_storage_used: runRecord.reroll_storage_used + rerollCost,
				...(date !== undefined && { shop_interacted_date: date }),
			})
			.where(eq(runsTable.id, runId))
			.returning();

		return {
			originalRun: runFactory.toDTO(runRecord),
			updatedRun: runFactory.toDTO(updatedRun),
		};
	});
};

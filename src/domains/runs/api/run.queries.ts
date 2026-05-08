import { eq, and, desc, sql } from "drizzle-orm";

import {
	runsTable,
	runCategoryCoverageTable,
	pollCategoriesTable,
} from "@/src/database/schema";
import { db } from "~/database/db";
import { getInitialPipelineSlots } from "~/domains/runs/services/pipeline.service";
import type {
	PipelineSlot,
	UpgradeCard,
} from "~/domains/runs/models/pipeline.model";
import type { CategoryCode } from "~/domains/shared/categories";

import { runFactory } from "../models/run.model";
import { runCategoryCoverageFactory } from "../models/runCategoryCoverage.model";

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
		const { getSeasonForNewRun } =
			await import("~/domains/ranking/services/seasonService");
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
	return db.select().from(runsTable).orderBy(desc(runsTable.created_at));
};

export const getAllRunsByUserId = async (userId: string) => {
	const records = await db
		.select()
		.from(runsTable)
		.where(eq(runsTable.user_id, userId))
		.orderBy(desc(runsTable.created_at));

	return runFactory.toDTOs(records);
};

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

// Preserves progress in final_* columns then resets current values
export const completeRunWithThresholdFailure = async (
	runId: number,
	reason: string
) => {
	return await db.transaction(async (tx) => {
		await tx
			.update(runCategoryCoverageTable)
			.set({
				final_coverage: sql`current_coverage`,
				final_streak: sql`current_streak`,
				final_polls_answered: sql`polls_answered`,
			})
			.where(eq(runCategoryCoverageTable.run_id, runId));

		await tx
			.update(runsTable)
			.set({
				status: "finished",
				finished_at: new Date(),
				completion_reason: reason,
			})
			.where(eq(runsTable.id, runId));

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
		.set({ active_config_ids: updatedConfigIds })
		.where(eq(runsTable.id, runId))
		.returning();

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

export const applyPipelineUpgrade = async (
	runId: number,
	currentSlots: PipelineSlot[],
	newSlots: PipelineSlot[],
	currentSnapshots: PipelineSlot[][]
) => {
	const [updatedRun] = await db
		.update(runsTable)
		.set({
			pipeline_slots: newSlots,
			pending_upgrade_cards: [],
			pipeline_slot_snapshots: [...currentSnapshots, currentSlots],
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return updatedRun ? runFactory.toDTO(updatedRun) : null;
};

export const resetPollRerolls = async (runId: number) => {
	const [updatedRun] = await db
		.update(runsTable)
		.set({ rerolls: 0 })
		.where(eq(runsTable.id, runId))
		.returning();

	return updatedRun ? runFactory.toDTO(updatedRun) : null;
};

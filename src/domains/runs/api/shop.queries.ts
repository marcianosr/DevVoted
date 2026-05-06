import { eq, sql } from "drizzle-orm";

import { runsTable, runCategoryCoverageTable } from "@/src/database/schema";
import { db } from "~/database/db";

import { runFactory } from "../models/run.model";
import { runCategoryCoverageFactory } from "../models/runCategoryCoverage.model";

const SKIP_SHOP_REWARD = 64 * 1024; // 64KB in bytes

export const skipShop = async (
	runId: number,
	date: string,
	storageBonus: number = 0
) => {
	const totalReward = SKIP_SHOP_REWARD + storageBonus;

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
 */
export const getAllActiveConfigIds = async (): Promise<string[]> => {
	const activeRuns = await db
		.select({ activeConfigIds: runsTable.active_config_ids })
		.from(runsTable)
		.where(eq(runsTable.status, "active"));

	return activeRuns.flatMap((run) => run.activeConfigIds);
};

export const processRerollShop = async (runId: number, date?: string) => {
	return await db.transaction(async (tx) => {
		const [runRecord] = await tx
			.select()
			.from(runsTable)
			.where(eq(runsTable.id, runId))
			.limit(1);

		if (!runRecord) {
			throw new Error("Run not found");
		}

		const { calculateRerollCost } =
			await import("~/domains/economy/services/reroll.service");
		const rerollCost = calculateRerollCost(runRecord.rerolls);

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

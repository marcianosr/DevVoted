import { eq } from "drizzle-orm";

import { db } from "~/database/db";
import { runsTable } from "~/database/schema";
import {
	addConfigsToRun,
	removeConfigsFromRun,
} from "~/domains/economy/services/configManager.service";
import { runFactory } from "~/domains/runs/models/run";

export const getRunByIdQuery = async (runId: number) => {
	const [runRecord] = await db
		.select()
		.from(runsTable)
		.where(eq(runsTable.id, runId))
		.limit(1);

	if (!runRecord) {
		throw new Error(`Run with id ${runId} not found`);
	}

	return runFactory.toDTO(runRecord);
};

export const addConfigToRunQuery = async (
	runId: number,
	configIds: string[],
	date?: string
) => {
	const [runRecord] = await db
		.select()
		.from(runsTable)
		.where(eq(runsTable.id, runId))
		.limit(1);

	if (!runRecord) {
		throw new Error(`Run with id ${runId} not found`);
	}

	const currentRun = runFactory.toDTO(runRecord);
	const updatedRun = addConfigsToRun(currentRun, configIds);

	const [updatedRunRecord] = await db
		.update(runsTable)
		.set({
			active_config_ids: updatedRun.activeConfigIds,
			...(date !== undefined && { shop_interacted_date: date }),
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return runFactory.toDTO(updatedRunRecord);
};

export const removeConfigFromRunQuery = async (
	runId: number,
	configIds: string[],
	date?: string
) => {
	const [runRecord] = await db
		.select()
		.from(runsTable)
		.where(eq(runsTable.id, runId))
		.limit(1);

	if (!runRecord) {
		throw new Error(`Run with id ${runId} not found`);
	}

	const currentRun = runFactory.toDTO(runRecord);
	const updatedRun = removeConfigsFromRun(currentRun, configIds);

	const [updatedRunRecord] = await db
		.update(runsTable)
		.set({
			active_config_ids: updatedRun.activeConfigIds,
			...(date !== undefined && { shop_interacted_date: date }),
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return runFactory.toDTO(updatedRunRecord);
};

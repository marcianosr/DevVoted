import { db } from "~/database/db";
import { runsTable } from "~/database/schema";
import { eq } from "drizzle-orm";
import { runFactory } from "~/domains/runs/models/run";
import {
	addConfigsToRun,
	removeConfigsFromRun,
} from "~/domains/configs/services/configStorage.service";

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
	configIds: string[]
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
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return runFactory.toDTO(updatedRunRecord);
};

export const removeConfigFromRunQuery = async (
	runId: number,
	configIds: string[]
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
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return runFactory.toDTO(updatedRunRecord);
};

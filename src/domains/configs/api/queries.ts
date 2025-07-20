import { db } from "~/database/db";
import { runsTable } from "~/database/schema";
import { eq } from "drizzle-orm";
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

	const currentConfigIdsFromDB = runRecord.active_config_ids || [];
	const configIdsSet = new Set(configIds);
	if (currentConfigIdsFromDB.some((id) => configIdsSet.has(id))) {
		return runFactory.toDTO(runRecord);
	}

	const updatedConfigIds = [
		...new Set([...currentConfigIdsFromDB, ...configIds]),
	];

	const [updatedRun] = await db
		.update(runsTable)
		.set({
			active_config_ids: updatedConfigIds,
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return runFactory.toDTO(updatedRun);
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

	const currentConfigIds = runRecord.active_config_ids || [];
	const updatedConfigIds = currentConfigIds.filter(
		(id) => !configIds.includes(id)
	);

	const [updatedRun] = await db
		.update(runsTable)
		.set({
			active_config_ids: updatedConfigIds,
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return runFactory.toDTO(updatedRun);
};

import { eq } from "drizzle-orm";

import { db } from "~/database/db";
import { runsTable } from "~/database/schema";
import { configs } from "~/domains/economy/data/configs";
import {
	addConfigsToRun,
	removeConfigsFromRun,
} from "~/domains/economy/services/configManager.service";
import { runFactory } from "~/domains/runs/models/run.model";

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
	deinstallPenalty?: number,
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
	const configToRemove = configs.find((config) =>
		configIds.includes(config.id)
	);

	if (!configToRemove) {
		throw new Error(`Config with id ${configIds.join(", ")} not found in run`);
	}

	const updatedRun = removeConfigsFromRun(currentRun, configIds);

	const [updatedRunRecord] = await db
		.update(runsTable)
		.set({
			active_config_ids: updatedRun.activeConfigIds,
			deinstall_penalty: currentRun.deinstallPenalty + (deinstallPenalty || 0),
			...(date !== undefined && { shop_interacted_date: date }),
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return runFactory.toDTO(updatedRunRecord);
};

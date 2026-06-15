import { eq } from "drizzle-orm";

import { db } from "~/database/db";
import { runsTable } from "~/database/schema";
import { configs } from "~/domains/economy/data/configs";
import {
	addConfigsToRun,
	addDiscountedConfigsToRun,
	removeConfigsFromRun,
} from "~/domains/economy/services/configManager.service";
import { runFactory } from "~/domains/runs/models/run.model";

export type PurchaseVariant = "normal" | "discount";

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
	date?: string,
	purchaseVariant: PurchaseVariant = "normal"
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
	const updatedRun =
		purchaseVariant === "discount"
			? addDiscountedConfigsToRun(currentRun, configIds)
			: addConfigsToRun(currentRun, configIds);

	const [updatedRunRecord] = await db
		.update(runsTable)
		.set({
			active_config_ids: updatedRun.activeConfigIds,
			discounted_config_ids: updatedRun.discountedConfigIds,
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

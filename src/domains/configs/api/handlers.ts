import { configs } from "~/domains/configs/data/configs";
import { canAddConfigToRun } from "~/domains/economy/services/configManager.service";
import { getAuthenticatedUserId } from "~/utils/authorization";
import { handleApiOperation } from "~/utils/errorHandling";

import {
	addConfigToRunQuery,
	removeConfigFromRunQuery,
	getRunByIdQuery,
} from "./queries";

export const addConfigToRunHandler = async ({
	data,
}: {
	data: { runId: number; configIds: string[]; date?: string };
}) => {
	return handleApiOperation(async () => {
		const userId = await getAuthenticatedUserId();
		const { runId, configIds, date } = data;

		const currentRun = await getRunByIdQuery(runId);

		if (currentRun.userId !== userId) {
			throw new Error("Unauthorized: Cannot modify another user's run");
		}

		const config = configs.find((c) => configIds.includes(c.id));
		if (!config) {
			throw new Error(`Config with id ${configIds} not found`);
		}

		if (!canAddConfigToRun(currentRun, config)) {
			throw new Error(
				"Cannot add config: insufficient storage or already exists"
			);
		}

		return await addConfigToRunQuery(runId, configIds, date);
	});
};

export const removeConfigFromRunHandler = async ({
	data,
}: {
	data: { runId: number; configIds: string[]; date?: string };
}) => {
	return handleApiOperation(async () => {
		const { runId, configIds, date } = data;
		return await removeConfigFromRunQuery(runId, configIds, date);
	});
};

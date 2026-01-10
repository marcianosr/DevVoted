import { configs, applyEffects } from "~/domains/configs/data/configs";
import { canAddConfigToRun } from "~/domains/economy/services/configManager.service";
import { REFUND_RATE } from "~/lib/storage";
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

		const { reductionCost } = applyEffects(
			{ poll: null as never, options: [], run: currentRun, hasAnswered: false },
			currentRun.activeConfigIds
		);

		if (!canAddConfigToRun(currentRun, config, configs, reductionCost)) {
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
	data: {
		runId: number;
		configIds: string[];
		date?: string;
	};
}) => {
	return handleApiOperation(async () => {
		const { runId, configIds, date } = data;

		// TODO: include other config effects in future if refundRate depends on them
		// const { refundRate } = applyEffects(..., run.activeConfigIds);

		// Get config cost before removing
		const configToRemove = configs.find((c) => configIds.includes(c.id));
		const penalty = (configToRemove?.cost ?? 0) * (1 - REFUND_RATE);

		return await removeConfigFromRunQuery(runId, configIds, penalty, date);
	});
};

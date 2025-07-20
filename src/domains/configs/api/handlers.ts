import {
	addConfigToRunQuery,
	removeConfigFromRunQuery,
	getRunByIdQuery,
} from "./queries";
import { handleApiOperation } from "~/shared/utils/errorHandling";
import { canAddConfigToRun } from "~/domains/configs/services/configStorage.service";
import { configs } from "~/domains/configs/data/configs";

export const addConfigToRunHandler = async ({
	data,
}: {
	data: { runId: number; configIds: string[] };
}) => {
	return handleApiOperation(async () => {
		const { runId, configIds } = data;

		const config = configs.find((c) => configIds.includes(c.id));
		if (!config) {
			throw new Error(`Config with id ${configIds} not found`);
		}

		const currentRun = await getRunByIdQuery(runId);

		if (!canAddConfigToRun(currentRun, config)) {
			throw new Error(
				"Cannot add config: insufficient storage or already exists"
			);
		}

		return await addConfigToRunQuery(runId, configIds);
	});
};

export const removeConfigFromRunHandler = async ({
	data,
}: {
	data: { runId: number; configIds: string[] };
}) => {
	return handleApiOperation(async () => {
		const { runId, configIds } = data;
		return await removeConfigFromRunQuery(runId, configIds);
	});
};

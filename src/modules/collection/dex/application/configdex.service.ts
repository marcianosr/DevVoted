import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import {
	type ConfigUnlockRow,
	fetchConfigUnlocksByUser,
	fetchObjectiveProgressByUser,
	type ObjectiveProgressRow,
} from "~/modules/collection/dex/infrastructure/configdex.repository";

export type ConfigdexData = {
	readonly unlocks: readonly ConfigUnlockRow[];
	readonly progress: readonly ObjectiveProgressRow[];
};

export const getConfigdexService = async ({
	userId,
}: {
	userId: string;
}): Promise<ApiResponse<ConfigdexData>> =>
	handleApiOperation(async () => {
		const [unlocks, progress] = await Promise.all([
			fetchConfigUnlocksByUser(userId),
			fetchObjectiveProgressByUser(userId),
		]);
		return { unlocks, progress };
	}, "getConfigdex");

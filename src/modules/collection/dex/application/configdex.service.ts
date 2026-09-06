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

/**
 * Flat rows only — the fold against the config roster happens client-side
 * (the roster ships in the bundle, and locked labels are no secret: the shop
 * shelf shows them). The redaction is presentation integrity, not transport.
 */
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
	});

import { handleApiOperation } from "~/shared/utils/errorHandling";

import {
	runHistory,
	type RunHistoryEntry,
} from "~/modules/collection/dex/domain/runHistory.model";
import { fetchGateRunsByUser } from "~/modules/collection/dex/infrastructure/runHistory.repository";

export type GateRunsData = {
	/** The archive listing, which counts only climbs that ended. */
	history: readonly RunHistoryEntry[];
};

export const getGateRunsService = async ({ userId }: { userId: string }) =>
	handleApiOperation(async (): Promise<GateRunsData> => {
		const rows = await fetchGateRunsByUser(userId);

		return { history: runHistory(rows) };
	}, "getGateRuns");

import { handleApiOperation } from "~/shared/utils/errorHandling";

import type { AuditdexRun } from "~/modules/collection/dex/domain/auditdex.model";
import {
	runHistory,
	type RunHistoryEntry,
} from "~/modules/collection/dex/domain/runHistory.model";
import {
	fetchGateRunsByUser,
	type GateRunRow,
} from "~/modules/collection/dex/infrastructure/runHistory.repository";
import { isRunOver } from "~/modules/run/run/domain/run.model";

export type GateRunsData = {
	/** The audits tally, which counts every climb including the live one. */
	runs: readonly AuditdexRun[];
	/** The archive listing, which counts only climbs that ended. */
	history: readonly RunHistoryEntry[];
};

const toAuditdexRun = (row: GateRunRow): AuditdexRun => ({
	gatesCleared: row.gatesCleared,
	finished: isRunOver(row.engineStatus),
});

export const getGateRunsService = async ({ userId }: { userId: string }) =>
	handleApiOperation(async (): Promise<GateRunsData> => {
		const rows = await fetchGateRunsByUser(userId);

		return { runs: rows.map(toAuditdexRun), history: runHistory(rows) };
	});

import { handleApiOperation } from "~/shared/utils/errorHandling";

import type { AuditdexRun } from "~/modules/collection/dex/domain/auditdex.model";
import {
	fetchGateRunsByUser,
	type GateRunRow,
} from "~/modules/collection/dex/infrastructure/runHistory.repository";
import type { RunStatus } from "~/modules/run/run/domain/run.model";

const OVER: readonly RunStatus[] = ["won", "dead"];

const toAuditdexRun = (row: GateRunRow): AuditdexRun => ({
	gatesCleared: row.gatesCleared,
	finished: OVER.includes(row.engineStatus),
});

export const getGateRunsService = async ({ userId }: { userId: string }) =>
	handleApiOperation(async () => ({
		runs: (await fetchGateRunsByUser(userId)).map(toAuditdexRun),
	}));

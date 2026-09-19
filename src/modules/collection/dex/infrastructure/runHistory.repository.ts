import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { runsTable, runStatesTable } from "~/database/schema";
import type { RunStatus } from "~/modules/run/run/domain/run.model";

export type GateRunRow = {
	runId: number;
	gatesCleared: number;
	engineStatus: RunStatus;
	coverage: number;
	startedAt: Date | null;
	finishedAt: Date | null;
	swatchGates: readonly number[] | null;
};

/**
 * Every session climb this account has taken, newest first. Calendar runs are
 * excluded: they never meet a gate.
 *
 * `run_states` denormalises `gates_cleared` and `coverage` off the state blob
 * precisely so a list like this never has to open it. The one thing still
 * trapped inside is the per-run swatch roster, pulled out here by JSON path so
 * the blob itself stays on the server.
 */
export const fetchGateRunsByUser = async (
	userId: string
): Promise<GateRunRow[]> =>
	db
		.select({
			runId: runsTable.id,
			gatesCleared: runStatesTable.gates_cleared,
			engineStatus: runStatesTable.engine_status,
			coverage: runStatesTable.coverage,
			startedAt: runsTable.started_at,
			finishedAt: runsTable.finished_at,
			swatchGates: sql<
				readonly number[] | null
			>`${runStatesTable.state} -> 'swatchGatesEarned'`,
		})
		.from(runStatesTable)
		.innerJoin(runsTable, eq(runStatesTable.run_id, runsTable.id))
		.where(and(eq(runsTable.user_id, userId), eq(runsTable.mode, "session")))
		.orderBy(desc(runsTable.started_at));

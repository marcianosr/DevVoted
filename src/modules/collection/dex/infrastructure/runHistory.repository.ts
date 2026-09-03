import { and, eq } from "drizzle-orm";

import { db } from "~/database/db";
import { runsTable, runStatesTable } from "~/database/schema";
import type { RunStatus } from "~/modules/run/run/domain/run.model";

export type GateRunRow = {
	gatesCleared: number;
	engineStatus: RunStatus;
};

/**
 * Every session climb this account has taken, as gates beaten plus where the
 * engine left off. Calendar runs are excluded: they never meet a gate.
 */
export const fetchGateRunsByUser = async (
	userId: string
): Promise<GateRunRow[]> =>
	db
		.select({
			gatesCleared: runStatesTable.gates_cleared,
			engineStatus: runStatesTable.engine_status,
		})
		.from(runStatesTable)
		.innerJoin(runsTable, eq(runStatesTable.run_id, runsTable.id))
		.where(and(eq(runsTable.user_id, userId), eq(runsTable.mode, "session")));

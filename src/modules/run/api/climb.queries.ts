import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { runStatesTable, runsTable, usersTable } from "~/database/schema";

import { SLICE_WINDOW } from "../rules.model";

/**
 * "Who's climbing" reads (DVTD-6l80). These are the queries `run_states`'
 * denormalized scalars were put there for — `gates_cleared` and friends exist so
 * this can be answered without opening the state blob, which is server-only
 * because it carries correctness data.
 *
 * Depth into the current gate is the one thing not denormalized, so it is dug
 * out with a JSON path *inside* the query: the blob stays in Postgres and only
 * an integer crosses the wire.
 */
const pollsIntoGate = sql<number>`coalesce((${runStatesTable.state}->'window'->>'answered')::int, 0)`;

/** The whole ladder position in one expression, for aggregates. */
const position = sql<number>`${runStatesTable.gates_cleared} * ${SLICE_WINDOW} + coalesce((${runStatesTable.state}->'window'->>'answered')::int, 0)`;

export type ClimberRow = {
	userId: string;
	displayName: string | null;
	photoUrl: string | null;
	gate: number;
	pollsIntoGate: number;
};

/**
 * Everyone with a live session run, wherever they are on the climb. Public
 * read-only progress — the same class of data as the community board's voter
 * chips — so it is not scoped to the viewer.
 */
export const fetchActiveClimbers = async (): Promise<ClimberRow[]> =>
	db
		.select({
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			gate: runStatesTable.gates_cleared,
			pollsIntoGate,
		})
		.from(runsTable)
		.innerJoin(runStatesTable, eq(runStatesTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(usersTable.id, runsTable.user_id))
		.where(and(eq(runsTable.mode, "session"), eq(runsTable.status, "active")));

/**
 * One run's place on the climb, whatever its status. The viewer's marker is read
 * this way rather than off the active-climber list, so a run that died today
 * still shows where it got to.
 */
export const fetchClimbMarker = async (
	runId: number
): Promise<{ gate: number; pollsIntoGate: number } | null> => {
	const [row] = await db
		.select({ gate: runStatesTable.gates_cleared, pollsIntoGate })
		.from(runStatesTable)
		.where(eq(runStatesTable.run_id, runId))
		.limit(1);
	return row ?? null;
};

export type FallenRow = {
	runId: number;
	userId: string;
	displayName: string | null;
	photoUrl: string | null;
	gate: number;
	pollsIntoGate: number;
};

/**
 * Runs a gate killed today. Abandoned runs are excluded on purpose: walking away
 * is not falling, and a gravestone would misreport it.
 *
 * `finished_at` is a timestamp, so the day is bounded in local time to match
 * `getTodayDateString()` — the same calendar day the rest of the run loop uses.
 */
export const fetchFallenToday = async (date: string): Promise<FallenRow[]> => {
	const dayStart = new Date(`${date}T00:00:00`);
	const dayEnd = new Date(dayStart);
	dayEnd.setDate(dayEnd.getDate() + 1);

	return db
		.select({
			runId: runsTable.id,
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			gate: runStatesTable.gates_cleared,
			pollsIntoGate,
		})
		.from(runsTable)
		.innerJoin(runStatesTable, eq(runStatesTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(usersTable.id, runsTable.user_id))
		.where(
			and(
				eq(runsTable.mode, "session"),
				eq(runsTable.status, "finished"),
				eq(runsTable.completion_reason, "dead"),
				gte(runsTable.finished_at, dayStart),
				lt(runsTable.finished_at, dayEnd)
			)
		);
};

/**
 * The deepest a finished run of theirs ever got, in polls. Every ending counts —
 * a run that died at gate 8 charted gate 8 just as much as one that won there.
 * `null` when they have never finished a run: a first climb has no ghost.
 */
export const fetchPersonalBestPosition = async (
	userId: string
): Promise<number | null> => {
	const [row] = await db
		.select({ best: sql<number | null>`max(${position})` })
		.from(runsTable)
		.innerJoin(runStatesTable, eq(runStatesTable.run_id, runsTable.id))
		.where(
			and(
				eq(runsTable.user_id, userId),
				eq(runsTable.mode, "session"),
				eq(runsTable.status, "finished")
			)
		);
	return row?.best ?? null;
};

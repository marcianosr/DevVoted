import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { runStatesTable, runsTable, usersTable } from "~/database/schema";

import type {
	AnsweredPoll,
	AnswerOutcome,
} from "~/modules/run/run/domain/runPoll.model";
import type { GateWindow } from "~/modules/run/config/domain/effect.model";
import type { Build } from "~/modules/run/build/domain/build.model";
import type { RunSnapshot } from "~/modules/run/run/domain/runSnapshot.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";

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
/**
 * Field names inside the `run_states.state` blob, each bound to the type that
 * owns it. The queries below read the blob by hand, and a JSON path that misses
 * yields null — every one of them is `coalesce`d, so a renamed field would show
 * up as a zero rather than an error (DVTD-rn26). Naming the keys through these
 * makes the rename a compile failure instead.
 *
 * `sql.raw` is safe here precisely because the argument cannot be anything but
 * a key of the type: there is no runtime input to inject.
 */
const stateKey = <K extends keyof RunSnapshot>(key: K) => sql.raw(`'${key}'`);
const windowKey = <K extends keyof GateWindow>(key: K) => sql.raw(`'${key}'`);
const buildKey = <K extends keyof Build>(key: K) => sql.raw(`'${key}'`);
const answeredKey = <K extends keyof AnsweredPoll>(key: K) => sql.raw(`${key}`);

const pollsIntoGate = sql<number>`coalesce((${runStatesTable.state}->${stateKey("window")}->>${windowKey("answered")})::int, 0)`;

/** The whole ladder position in one expression, for aggregates.
 *  Mirrors trackPosition; climbMap.model.spec pins the formula. */
const position = sql<number>`${runStatesTable.gates_cleared} * ${SLICE_WINDOW} + coalesce((${runStatesTable.state}->${stateKey("window")}->>${windowKey("answered")})::int, 0)`;

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

export type ActiveRunStatsRow = {
	userId: string;
	displayName: string | null;
	photoUrl: string | null;
	gatesCleared: number;
	coverage: number;
	configCount: number;
	outcomes: AnswerOutcome[];
	streak: number;
};

/**
 * Every live run's standing, for the run-scoped standouts (DVTD-wp69).
 *
 * `outcomes` is extracted rather than the whole answer history: an `AnsweredPoll`
 * carries the poll's `correct` option ids, and there is no reason to lift
 * correctness data into Node just to measure a streak. Postgres unnests the
 * array and hands back the verdicts alone.
 */
export const fetchActiveRunStats = async (): Promise<ActiveRunStatsRow[]> =>
	db
		.select({
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			gatesCleared: runStatesTable.gates_cleared,
			coverage: runStatesTable.coverage,
			configCount: sql<number>`coalesce(json_array_length(${runStatesTable.state}->${stateKey("build")}->${buildKey("configs")}), 0)`,
			outcomes: sql<AnswerOutcome[]>`coalesce((
				select json_agg(entry->>'${answeredKey("outcome")}' order by ord)
				from json_array_elements(${runStatesTable.state}->${stateKey("allAnswered")})
					with ordinality as history(entry, ord)
			), '[]'::json)`,
			streak: sql<number>`coalesce((${runStatesTable.state}->>${stateKey("streak")})::int, 0)`,
		})
		.from(runsTable)
		.innerJoin(runStatesTable, eq(runStatesTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(usersTable.id, runsTable.user_id))
		.where(and(eq(runsTable.mode, "session"), eq(runsTable.status, "active")));

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
/**
 * The half-open local-day window `[start, end)` for a `yyyy-MM-dd` date.
 *
 * Local, not UTC: the seed date is the player's calendar day (`getTodayDateString`),
 * so a run that ended at 23:30 belongs to the day the player was living in.
 * Omitting the time would parse as UTC midnight and shift the boundary by the
 * offset — which in practice moves late-evening deaths onto the wrong day.
 *
 * Exported for its spec: the arithmetic is the part worth pinning, and the
 * query around it needs a database to say anything.
 */
export const localDayRange = (date: string): { start: Date; end: Date } => {
	const start = new Date(`${date}T00:00:00`);
	const end = new Date(start);
	end.setDate(end.getDate() + 1);
	return { start, end };
};

export const fetchFallenToday = async (date: string): Promise<FallenRow[]> => {
	const { start: dayStart, end: dayEnd } = localDayRange(date);

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

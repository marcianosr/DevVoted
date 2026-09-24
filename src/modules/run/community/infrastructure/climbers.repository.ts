import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { runStatesTable, runsTable, usersTable } from "~/database/schema";
import { findBorderById } from "~/modules/account/profile/domain/border.model";
import { localDayRange } from "~/shared/lib/dateUtils";

import type { GateWindow } from "~/modules/run/config/domain/effect.model";
import type { Build } from "~/modules/run/build/domain/build.model";
import {
	type PublicBuild,
	publicBuildOf,
	type StoredPublicBuild,
} from "~/modules/run/build/domain/publicBuild.model";
import type { RunSnapshot } from "~/modules/run/run/domain/runSnapshot.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type { Config } from "~/modules/run/config/domain/config.model";

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
const configKey = <K extends keyof Config>(key: K) => sql.raw(`'${key}'`);
const storedKey = <K extends keyof StoredPublicBuild>(key: K) =>
	sql.raw(`'${key}'`);

const pollsIntoGate = sql<number>`coalesce((${runStatesTable.state}->${stateKey("window")}->>${windowKey("answered")})::int, 0)`;

/** The whole ladder position in one expression, for aggregates.
 *  Mirrors trackPosition; climbMap.model.spec pins the formula. */
const position = sql<number>`${runStatesTable.gates_cleared} * ${SLICE_WINDOW} + coalesce((${runStatesTable.state}->${stateKey("window")}->>${windowKey("answered")})::int, 0)`;

const buildPath = sql`${runStatesTable.state}->${stateKey("build")}`;

/**
 * A run's build as anyone may read it (ADR-101): ids, versions and the lock, in
 * install order. The roster restates everything else in `publicBuildOf`, so no
 * embedded config object ever leaves Postgres.
 */
export const publicBuildColumn = sql<StoredPublicBuild>`json_build_object(
	${storedKey("configs")}, coalesce((
		select json_agg(json_build_object(
			${configKey("id")}, cfg->>${configKey("id")},
			${configKey("level")}, cfg->${configKey("level")},
			${configKey("minified")}, cfg->${configKey("minified")}
		) order by ord)
		from json_array_elements(${buildPath}->${buildKey("configs")})
			with ordinality as build(cfg, ord)
	), '[]'::json),
	${storedKey("vendorLockedConfigId")}, ${buildPath}->>${buildKey("vendorLockedConfigId")}
)`;

export const borderUrlOf = (equippedBorderId: string | null): string | null => {
	if (equippedBorderId === null) return null;
	return findBorderById(equippedBorderId)?.image ?? null;
};

export type ClimberRow = {
	userId: string;
	displayName: string | null;
	photoUrl: string | null;
	borderUrl: string | null;
	gate: number;
	pollsIntoGate: number;
	build: PublicBuild;
};

/**
 * Everyone with a live session run, wherever they are on the climb. Public
 * read-only progress — the same class of data as the community board's voter
 * chips — so it is not scoped to the viewer.
 */
export const fetchActiveClimbers = async (): Promise<ClimberRow[]> => {
	const rows = await db
		.select({
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			equippedBorderId: usersTable.equipped_border_id,
			gate: runStatesTable.gates_cleared,
			pollsIntoGate,
			build: publicBuildColumn,
		})
		.from(runsTable)
		.innerJoin(runStatesTable, eq(runStatesTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(usersTable.id, runsTable.user_id))
		.where(and(eq(runsTable.mode, "session"), eq(runsTable.status, "active")));
	return rows.map(({ equippedBorderId, build, ...row }) => ({
		...row,
		borderUrl: borderUrlOf(equippedBorderId),
		build: publicBuildOf(build),
	}));
};

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
	borderUrl: string | null;
	gate: number;
	pollsIntoGate: number;
	build: PublicBuild;
};

/**
 * Runs a gate killed today. Abandoned runs are excluded on purpose: walking away
 * is not falling, and a gravestone would misreport it.
 *
 * `finished_at` is a timestamp, so the day is bounded in local time to match
 * `getTodayDateString()` — the same calendar day the rest of the run loop uses.
 */
export const fetchFallenToday = async (date: string): Promise<FallenRow[]> => {
	const { start: dayStart, end: dayEnd } = localDayRange(date);

	const rows = await db
		.select({
			runId: runsTable.id,
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			equippedBorderId: usersTable.equipped_border_id,
			gate: runStatesTable.gates_cleared,
			pollsIntoGate,
			build: publicBuildColumn,
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
	return rows.map(({ equippedBorderId, build, ...row }) => ({
		...row,
		borderUrl: borderUrlOf(equippedBorderId),
		build: publicBuildOf(build),
	}));
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

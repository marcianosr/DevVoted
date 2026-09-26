import { and, eq, gte, inArray, like, lt, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	runStatesTable,
	runsTable,
	userObjectiveProgressTable,
	usersTable,
} from "~/database/schema";
import { borderUrlOf } from "~/modules/account/profile/domain/border.model";
import { primaryTitleName } from "~/modules/account/profile/domain/title.model";
import { localDayRange } from "~/shared/lib/dateUtils";

import type { GateWindow } from "~/modules/run/config/domain/effect.model";
import type { Build } from "~/modules/run/build/domain/build.model";
import {
	type PublicBuild,
	publicBuildOf,
	type StoredPublicBuild,
} from "~/modules/run/build/domain/publicBuild.model";
import type { RunSnapshot } from "~/modules/run/run/domain/runSnapshot.model";
import type { LastClose } from "~/modules/run/run/domain/run.model";
import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type { Config } from "~/modules/run/config/domain/config.model";

const stateKey = <K extends keyof RunSnapshot>(key: K) => sql.raw(`'${key}'`);
const windowKey = <K extends keyof GateWindow>(key: K) => sql.raw(`'${key}'`);
const buildKey = <K extends keyof Build>(key: K) => sql.raw(`'${key}'`);
const configKey = <K extends keyof Config>(key: K) => sql.raw(`'${key}'`);
const storedKey = <K extends keyof StoredPublicBuild>(key: K) =>
	sql.raw(`'${key}'`);

const pollsIntoGate = sql<number>`coalesce((${runStatesTable.state}->${stateKey("window")}->>${windowKey("answered")})::int, 0)`;

const position = sql<number>`${runStatesTable.gates_cleared} * ${SLICE_WINDOW} + coalesce((${runStatesTable.state}->${stateKey("window")}->>${windowKey("answered")})::int, 0)`;

const lastCloseColumn = sql<LastClose | null>`${runStatesTable.state}->${stateKey("lastClose")}`;

const startedAtGateColumn = sql<number>`coalesce((${runStatesTable.state}->>${stateKey("startedAtGate")})::int, 0)`;

const streakColumn = sql<number>`coalesce((${runStatesTable.state}->>${stateKey("streak")})::int, 0)`;
const storageColumn = sql<number>`coalesce((${runStatesTable.state}->>${stateKey("storage")})::int, 0)`;

const buildPath = sql`${runStatesTable.state}->${stateKey("build")}`;

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

export type ClimberRow = {
	userId: string;
	displayName: string | null;
	photoUrl: string | null;
	borderUrl: string | null;
	gate: number;
	pollsIntoGate: number;
	build: PublicBuild;
	closingBand: CoverageBandId | null;
	startedAtGate: number;
	handle: string | null;
	title: string | null;
	coverageUnits: number;
	streak: number;
	storageKb: number;
};

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
			lastClose: lastCloseColumn,
			startedAtGate: startedAtGateColumn,
			handle: usersTable.github_username,
			titleIds: usersTable.equipped_title_ids,
			coverageUnits: runStatesTable.coverage,
			streak: streakColumn,
			storageKb: storageColumn,
		})
		.from(runsTable)
		.innerJoin(runStatesTable, eq(runStatesTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(usersTable.id, runsTable.user_id))
		.where(and(eq(runsTable.mode, "session"), eq(runsTable.status, "active")));
	return rows.map(
		({ equippedBorderId, build, lastClose, titleIds, ...row }) => ({
			...row,
			borderUrl: borderUrlOf(equippedBorderId),
			build: publicBuildOf(build),
			closingBand: lastClose?.band ?? null,
			title: primaryTitleName(titleIds),
		})
	);
};

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
	closingBand: CoverageBandId | null;
	startedAtGate: number;
	handle: string | null;
	title: string | null;
	coverageUnits: number;
	streak: number;
	storageKb: number;
};

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
			lastClose: lastCloseColumn,
			startedAtGate: startedAtGateColumn,
			handle: usersTable.github_username,
			titleIds: usersTable.equipped_title_ids,
			coverageUnits: runStatesTable.coverage,
			streak: streakColumn,
			storageKb: storageColumn,
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
	return rows.map(
		({ equippedBorderId, build, lastClose, titleIds, ...row }) => ({
			...row,
			borderUrl: borderUrlOf(equippedBorderId),
			build: publicBuildOf(build),
			closingBand: lastClose?.band ?? null,
			title: primaryTitleName(titleIds),
		})
	);
};

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

const CATEGORY_CORRECT = "category-correct:";

export const fetchBestCategories = async (
	userIds: readonly string[]
): Promise<Map<string, string>> => {
	if (userIds.length === 0) return new Map();

	const rows = await db
		.select({
			userId: userObjectiveProgressTable.user_id,
			metric: userObjectiveProgressTable.metric,
			count: userObjectiveProgressTable.count,
		})
		.from(userObjectiveProgressTable)
		.where(
			and(
				inArray(userObjectiveProgressTable.user_id, [...userIds]),
				like(userObjectiveProgressTable.metric, `${CATEGORY_CORRECT}%`)
			)
		);

	const best = new Map<string, { category: string; count: number }>();
	for (const row of rows) {
		if (row.count <= 0) continue;
		const category = row.metric.slice(CATEGORY_CORRECT.length);
		const held = best.get(row.userId);
		if (
			held === undefined ||
			row.count > held.count ||
			(row.count === held.count && category < held.category)
		)
			best.set(row.userId, { category, count: row.count });
	}

	return new Map([...best].map(([userId, { category }]) => [userId, category]));
};

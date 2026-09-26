import { and, asc, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "~/database/db";
import {
	auditIncidentsTable,
	auditIncidentStatus,
	runStatesTable,
	runsTable,
	usersTable,
} from "~/database/schema";

import { borderUrlOf } from "~/modules/account/profile/domain/border.model";
import { primaryTitleName } from "~/modules/account/profile/domain/title.model";
import { publicBuildOf } from "~/modules/run/build/domain/publicBuild.model";
import { publicBuildColumn } from "~/modules/run/community/infrastructure/climbers.repository";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import {
	type QueuedByRun,
	type QueuedIncident,
	queuedByRun,
	type RivalCandidate,
} from "~/modules/run/incident/domain/incident.model";
import type {
	IncidentSender,
	LastClose,
} from "~/modules/run/run/domain/run.model";
import type { RunSnapshot } from "~/modules/run/run/domain/runSnapshot.model";
import { localDayRange } from "~/shared/lib/dateUtils";

export type IncidentStatus = (typeof auditIncidentStatus.enumValues)[number];

type Reader = Pick<typeof db, "select">;
type Writer = Pick<typeof db, "update">;
type Inserter = Pick<typeof db, "insert">;

const stateKey = <K extends keyof RunSnapshot>(key: K) => sql.raw(`'${key}'`);

const UNNAMED_RIVAL = "a climber";

const senderOf = (id: string, name: string | null): IncidentSender => ({
	id,
	name: name ?? UNNAMED_RIVAL,
});

export const fetchRivalCandidates = async (): Promise<RivalCandidate[]> => {
	const rows = await db
		.select({
			runId: runsTable.id,
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			borderId: usersTable.equipped_border_id,
			titleIds: usersTable.equipped_title_ids,
			gatesCleared: runStatesTable.gates_cleared,
			lastClose: sql<LastClose | null>`${runStatesTable.state}->${stateKey("lastClose")}`,
			build: publicBuildColumn,
		})
		.from(runsTable)
		.innerJoin(runStatesTable, eq(runStatesTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(usersTable.id, runsTable.user_id))
		.where(and(eq(runsTable.mode, "session"), eq(runsTable.status, "active")));

	return rows.map(
		({
			displayName,
			photoUrl,
			borderId,
			titleIds,
			lastClose,
			build,
			...row
		}) => {
			const borderUrl = borderUrlOf(borderId);
			const title = primaryTitleName(titleIds);
			return {
				...row,
				name: displayName ?? UNNAMED_RIVAL,
				build: publicBuildOf(build),
				...(photoUrl === null ? {} : { photoUrl }),
				...(borderUrl === null ? {} : { borderUrl }),
				...(title === null ? {} : { title }),
				...(lastClose === null ? {} : { lastClose }),
			};
		}
	);
};

export const fetchQueuedByRun = async (): Promise<QueuedByRun> => {
	const rows = await db
		.select({
			runId: auditIncidentsTable.target_run_id,
			gate: auditIncidentsTable.target_gate,
			auditId: auditIncidentsTable.audit_id,
		})
		.from(auditIncidentsTable)
		.where(eq(auditIncidentsTable.status, "queued"));

	return queuedByRun(rows);
};

export const fetchLastTargetUserId = async (
	sentByUserId: string
): Promise<string | null> => {
	const [row] = await db
		.select({ targetUserId: auditIncidentsTable.target_user_id })
		.from(auditIncidentsTable)
		.where(eq(auditIncidentsTable.sent_by_user_id, sentByUserId))
		.orderBy(desc(auditIncidentsTable.created_at))
		.limit(1);
	return row?.targetUserId ?? null;
};

export const fetchQueuedIncidents = async (
	tx: Reader,
	runId: number,
	gate: number
): Promise<QueuedIncident[]> => {
	const rows = await tx
		.select({
			id: auditIncidentsTable.id,
			auditId: auditIncidentsTable.audit_id,
			senderId: auditIncidentsTable.sent_by_user_id,
			senderName: usersTable.display_name,
		})
		.from(auditIncidentsTable)
		.innerJoin(
			usersTable,
			eq(usersTable.id, auditIncidentsTable.sent_by_user_id)
		)
		.where(
			and(
				eq(auditIncidentsTable.target_run_id, runId),
				eq(auditIncidentsTable.target_gate, gate),
				eq(auditIncidentsTable.status, "queued")
			)
		)
		.orderBy(asc(auditIncidentsTable.created_at))
		.for("update", { of: auditIncidentsTable });

	return rows.map((row) => ({
		id: row.id,
		auditId: row.auditId,
		sentBy: senderOf(row.senderId, row.senderName),
	}));
};

export type NewIncident = {
	readonly sentByUserId: string;
	readonly targetUserId: string;
	readonly targetRunId: number;
	readonly targetGate: number;
	readonly auditId: AuditId;
};

export const insertIncident = async (
	tx: Inserter,
	incident: NewIncident
): Promise<void> => {
	await tx.insert(auditIncidentsTable).values({
		sent_by_user_id: incident.sentByUserId,
		target_user_id: incident.targetUserId,
		target_run_id: incident.targetRunId,
		target_gate: incident.targetGate,
		audit_id: incident.auditId,
	});
};

export const markIncidents = async (
	tx: Writer,
	ids: readonly number[],
	status: IncidentStatus
): Promise<void> => {
	if (ids.length === 0) return;
	await tx
		.update(auditIncidentsTable)
		.set({ status, ...(status === "locked" ? { locked_at: new Date() } : {}) })
		.where(inArray(auditIncidentsTable.id, [...ids]));
};

export const carryIncidentsForward = async (
	tx: Writer,
	ids: readonly number[]
): Promise<void> => {
	if (ids.length === 0) return;
	await tx
		.update(auditIncidentsTable)
		.set({ target_gate: sql`${auditIncidentsTable.target_gate} + 1` })
		.where(inArray(auditIncidentsTable.id, [...ids]));
};

export const markSurvived = async (
	tx: Writer,
	runId: number,
	gate: number
): Promise<void> => {
	await tx
		.update(auditIncidentsTable)
		.set({ status: "survived" })
		.where(
			and(
				eq(auditIncidentsTable.target_run_id, runId),
				eq(auditIncidentsTable.target_gate, gate),
				eq(auditIncidentsTable.status, "locked")
			)
		);
};

export const endIncidentsForRun = async (
	runId: number,
	tx: Writer = db
): Promise<void> => {
	await tx
		.update(auditIncidentsTable)
		.set({ status: "failed" })
		.where(
			and(
				eq(auditIncidentsTable.target_run_id, runId),
				eq(auditIncidentsTable.status, "locked")
			)
		);
	await tx
		.update(auditIncidentsTable)
		.set({ status: "lapsed" })
		.where(
			and(
				eq(auditIncidentsTable.target_run_id, runId),
				eq(auditIncidentsTable.status, "queued")
			)
		);
};

export type IncidentFeedRow = {
	readonly id: number;
	readonly sentBy: IncidentSender;
	readonly target: IncidentSender;
	readonly targetGate: number;
	readonly auditId: AuditId;
	readonly status: IncidentStatus;
	readonly createdAt: Date;
};

export const fetchIncidentsForDate = async (
	date: string
): Promise<IncidentFeedRow[]> => {
	const sender = alias(usersTable, "sender");
	const target = alias(usersTable, "target");
	const { start, end } = localDayRange(date);
	const rows = await db
		.select({
			id: auditIncidentsTable.id,
			senderId: auditIncidentsTable.sent_by_user_id,
			senderName: sender.display_name,
			targetId: auditIncidentsTable.target_user_id,
			targetName: target.display_name,
			targetGate: auditIncidentsTable.target_gate,
			auditId: auditIncidentsTable.audit_id,
			status: auditIncidentsTable.status,
			createdAt: auditIncidentsTable.created_at,
		})
		.from(auditIncidentsTable)
		.innerJoin(sender, eq(sender.id, auditIncidentsTable.sent_by_user_id))
		.innerJoin(target, eq(target.id, auditIncidentsTable.target_user_id))
		.where(
			and(
				gte(auditIncidentsTable.created_at, start),
				lt(auditIncidentsTable.created_at, end)
			)
		)
		.orderBy(desc(auditIncidentsTable.created_at));

	return rows.map((row) => ({
		id: row.id,
		sentBy: senderOf(row.senderId, row.senderName),
		target: senderOf(row.targetId, row.targetName),
		targetGate: row.targetGate,
		auditId: row.auditId,
		status: row.status,
		createdAt: row.createdAt,
	}));
};

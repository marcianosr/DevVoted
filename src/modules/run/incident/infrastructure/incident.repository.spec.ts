import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import { auditIncidentsTable } from "~/database/schema";
import {
	carryIncidentsForward,
	endIncidentsForRun,
	fetchIncidentsForDate,
	fetchLastTargetUserId,
	fetchQueuedByRun,
	fetchQueuedIncidents,
	fetchRivalCandidates,
	insertIncident,
	markIncidents,
	markSurvived,
} from "~/modules/run/incident/infrastructure/incident.repository";
import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";
import { TEST_DATES } from "~/test/kanto";

const mock = vi.hoisted((): DrizzleMockState => ({
	results: [],
	setCalls: [],
	valuesCalls: [],
	insertTables: [],
	updateTables: [],
	deleteTables: [],
}));

vi.mock("~/database/db", async () => {
	const { createMockDb } = await import("~/test/drizzleMock.factory");
	return { db: createMockDb(mock) };
});

const RUN_ID = 64;

describe("incident.repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	describe("fetchRivalCandidates", () => {
		it("names an unnamed rival, reads the build off the roster, and leaves a run that never closed without a lastClose", async () => {
			mock.results.push([
				{
					runId: 2,
					userId: "misty",
					displayName: "Misty",
					gatesCleared: 6,
					lastClose: { gate: 5, band: "healthy", cleared: true },
					build: {
						configs: [
							{ id: "ts", level: 4, minified: null },
							{ id: "retired-config", level: null, minified: null },
						],
						vendorLockedConfigId: "ts",
					},
				},
				{
					runId: 3,
					userId: "brock",
					displayName: null,
					gatesCleared: 0,
					lastClose: null,
					build: { configs: [], vendorLockedConfigId: null },
				},
			]);

			expect(await fetchRivalCandidates()).toEqual([
				{
					runId: 2,
					userId: "misty",
					name: "Misty",
					gatesCleared: 6,
					lastClose: { gate: 5, band: "healthy", cleared: true },
					build: {
						configs: [{ id: "ts", label: ".ts", slots: 1, level: 4 }],
						vendorLockedConfigId: "ts",
					},
				},
				{
					runId: 3,
					userId: "brock",
					name: "a climber",
					gatesCleared: 0,
					build: { configs: [] },
				},
			]);
		});
	});

	describe("fetchQueuedByRun", () => {
		it("folds queued rows into audit ids per run and gate", async () => {
			mock.results.push([
				{ runId: 2, gate: 7, auditId: "not-found" },
				{ runId: 2, gate: 7, auditId: "memory-leak" },
				{ runId: 3, gate: 9, auditId: "timeout" },
			]);

			const queued = await fetchQueuedByRun();

			expect(queued.get(2)?.get(7)).toEqual(["not-found", "memory-leak"]);
			expect(queued.get(3)?.get(9)).toEqual(["timeout"]);
			expect(queued.get(3)?.get(7)).toBeUndefined();
		});
	});

	describe("fetchLastTargetUserId", () => {
		it("reads back who the attacker aimed at last, or nobody", async () => {
			mock.results.push([{ targetUserId: "misty" }]);
			expect(await fetchLastTargetUserId("red")).toBe("misty");

			mock.results.push([]);
			expect(await fetchLastTargetUserId("red")).toBeNull();
		});
	});

	describe("fetchQueuedIncidents", () => {
		it("hands back arrival-ordered incidents with their sender named", async () => {
			mock.results.push([
				{ id: 1, auditId: "not-found", senderId: "misty", senderName: "Misty" },
				{ id: 2, auditId: "timeout", senderId: "brock", senderName: null },
			]);

			expect(await fetchQueuedIncidents(db, RUN_ID, 7)).toEqual([
				{ id: 1, auditId: "not-found", sentBy: { id: "misty", name: "Misty" } },
				{
					id: 2,
					auditId: "timeout",
					sentBy: { id: "brock", name: "a climber" },
				},
			]);
		});
	});

	describe("insertIncident", () => {
		it("files the row the settlement will later lock", async () => {
			await insertIncident(db, {
				sentByUserId: "red",
				targetUserId: "misty",
				targetRunId: 2,
				targetGate: 7,
				auditId: "not-found",
			});

			expect(mock.insertTables).toEqual([auditIncidentsTable]);
			expect(mock.valuesCalls).toEqual([
				{
					sent_by_user_id: "red",
					target_user_id: "misty",
					target_run_id: 2,
					target_gate: 7,
					audit_id: "not-found",
				},
			]);
		});
	});

	describe("markIncidents", () => {
		it("stamps the lock time only when locking", async () => {
			await markIncidents(db, [1, 2], "locked");
			await markIncidents(db, [3], "lapsed");

			expect(mock.setCalls[0]).toMatchObject({ status: "locked" });
			expect(mock.setCalls[0].locked_at).toBeInstanceOf(Date);
			expect(mock.setCalls[1]).toEqual({ status: "lapsed" });
		});

		it("issues no query for an empty list", async () => {
			await markIncidents(db, [], "locked");
			await carryIncidentsForward(db, []);

			expect(db.update).not.toHaveBeenCalled();
		});
	});

	describe("markSurvived and endIncidentsForRun", () => {
		it("marks the cleared gate's locked incidents survived", async () => {
			await markSurvived(db, RUN_ID, 8);
			expect(mock.setCalls).toEqual([{ status: "survived" }]);
		});

		it("fails what was locked and lapses what was still queued", async () => {
			await endIncidentsForRun(RUN_ID);
			expect(mock.setCalls).toEqual([
				{ status: "failed" },
				{ status: "lapsed" },
			]);
		});
	});

	describe("fetchIncidentsForDate", () => {
		it("names both parties of every incident filed that day", async () => {
			const createdAt = new Date(`${TEST_DATES.birthday}T09:00:00`);
			mock.results.push([
				{
					id: 5,
					senderId: "red",
					senderName: "Red",
					targetId: "misty",
					targetName: null,
					targetGate: 7,
					auditId: "not-found",
					status: "queued",
					createdAt,
				},
			]);

			expect(await fetchIncidentsForDate(TEST_DATES.birthday)).toEqual([
				{
					id: 5,
					sentBy: { id: "red", name: "Red" },
					target: { id: "misty", name: "a climber" },
					targetGate: 7,
					auditId: "not-found",
					status: "queued",
					createdAt,
				},
			]);
		});
	});
});

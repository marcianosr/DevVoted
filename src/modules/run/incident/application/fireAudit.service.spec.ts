import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	attackerOf,
	offersForAttacker,
} from "~/modules/run/incident/application/attackTargets.service";
import { fireAuditService } from "~/modules/run/incident/application/fireAudit.service";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import type { RivalCandidate } from "~/modules/run/incident/domain/incident.model";
import * as incidents from "~/modules/run/incident/infrastructure/incident.repository";
import { dispatchRunActionService } from "~/modules/run/run/application/run.service";
import { clearGate, started } from "~/modules/run/run/domain/run.factory";
import type { RunState } from "~/modules/run/run/domain/run.model";
import * as runs from "~/modules/run/run/infrastructure/run.repository";
import type { RunTx } from "~/modules/run/run/infrastructure/run.repository";
import { createMockRunRecord } from "~/test/runRecord.factory";
import { createMockRunView } from "~/test/runView.factory";

vi.mock("~/modules/run/run/infrastructure/run.repository", () => ({
	findActiveSessionRun: vi.fn(),
	loadRunState: vi.fn(),
}));

vi.mock("~/modules/run/incident/infrastructure/incident.repository", () => ({
	fetchRivalCandidates: vi.fn(),
	fetchQueuedByRun: vi.fn(),
	fetchLastTargetUserId: vi.fn(),
	insertIncident: vi.fn(),
}));

vi.mock("~/modules/run/run/application/run.service", () => ({
	dispatchRunActionService: vi.fn(),
}));

vi.mock(
	"~/modules/run/incident/application/incidentSettlement.service",
	() => ({
		settleIncidents: vi.fn(
			() => async (_tx: unknown, _before: RunState, after: RunState) => after
		),
	})
);

const USER = "red";
const DATE = "2026-09-22";
const RUN = createMockRunRecord({ id: 1, user_id: USER });
const MISTY: RivalCandidate = {
	runId: 2,
	userId: "misty",
	name: "Misty",
	gatesCleared: 6,
	lastClose: { gate: 5, band: "healthy", cleared: true },
	build: { configs: [] },
};
const tx = {} as unknown as RunTx;

/** A debrief with an heldAudit in hand: the one place a fire is legal. */
const armedAtPrep = (): RunState => {
	const cleared = clearGate({
		...started(["js"]),
		gatesCleared: 5,
		bankedUnits: 20,
	});
	return {
		...cleared,
		heldAudit: { band: "healthy", gate: 4, payload: "not-found" },
	};
};

const fire = (targetRunId: number, auditId: AuditId) =>
	fireAuditService({ userId: USER, date: DATE, targetRunId, auditId });

const offeredPayload = async (state: RunState) => {
	const [offer] = await offersForAttacker(
		attackerOf(RUN.id, USER, state, { band: "healthy", gate: 4 }),
		DATE
	);
	return { offer, auditId: offer.payloads[0] };
};

describe("fireAuditService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(RUN);
		vi.mocked(incidents.fetchRivalCandidates).mockResolvedValue([MISTY]);
		vi.mocked(incidents.fetchQueuedByRun).mockResolvedValue(new Map());
		vi.mocked(incidents.fetchLastTargetUserId).mockResolvedValue(null);
		vi.mocked(dispatchRunActionService).mockResolvedValue({
			success: true,
			data: createMockRunView(),
		});
	});

	it("refuses to fire with nothing armed", async () => {
		vi.mocked(runs.loadRunState).mockResolvedValue(started(["js"]));

		const result = await fire(2, "not-found");

		expect(result.success).toBe(false);
		if (!result.success) expect(result.error).toContain("Nothing is armed");
		expect(dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("refuses to fire mid-window, where no picker was offered", async () => {
		vi.mocked(runs.loadRunState).mockResolvedValue({
			...started(["js"]),
			heldAudit: { band: "healthy", gate: 4 },
		});

		const result = await fire(2, "not-found");

		expect(result.success).toBe(false);
		if (!result.success) expect(result.error).toContain("Aim from prep");
	});

	it("refuses a pair it did not deal, and says the rival moved on", async () => {
		const state = armedAtPrep();
		vi.mocked(runs.loadRunState).mockResolvedValue(state);
		const { auditId } = await offeredPayload(state);

		const wrongRun = await fire(99, auditId);
		const wrongPayload = await fire(
			2,
			auditId === "strip" ? "not-found" : "strip"
		);

		expect(wrongRun.success).toBe(false);
		if (!wrongRun.success) expect(wrongRun.error).toContain("moved on");
		expect(wrongPayload.success).toBe(false);
		expect(dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("spends the credit through the reducer and files the incident beside it", async () => {
		const state = armedAtPrep();
		vi.mocked(runs.loadRunState).mockResolvedValue(state);
		const { offer, auditId } = await offeredPayload(state);

		const result = await fire(2, auditId);

		expect(result.success).toBe(true);
		const dispatched = vi.mocked(dispatchRunActionService).mock.calls[0][0];
		expect(dispatched).toMatchObject({
			userId: USER,
			date: DATE,
			action: { type: "fire-audit" },
		});

		const settle = dispatched.settle?.(RUN.id);
		if (settle === undefined) throw new Error("no settlement composed");
		await settle(tx, state, { ...state, heldAudit: undefined });

		expect(incidents.insertIncident).toHaveBeenCalledWith(tx, {
			sentByUserId: USER,
			targetUserId: "misty",
			targetRunId: 2,
			targetGate: offer.targetGate,
			auditId,
		});
	});

	it("files nothing when the reducer refused to spend the credit", async () => {
		const state = armedAtPrep();
		vi.mocked(runs.loadRunState).mockResolvedValue(state);
		const { auditId } = await offeredPayload(state);

		await fire(2, auditId);
		const settle = vi
			.mocked(dispatchRunActionService)
			.mock.calls[0][0].settle?.(RUN.id);
		if (settle === undefined) throw new Error("no settlement composed");
		await settle(tx, state, state);

		expect(incidents.insertIncident).not.toHaveBeenCalled();
	});
});

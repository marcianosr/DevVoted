import { beforeEach, describe, expect, it, vi } from "vitest";

import { lootFallenRunService } from "~/modules/run/community/application/loot.service";
import * as climbers from "~/modules/run/community/infrastructure/climbers.repository";
import type { FallenRow } from "~/modules/run/community/infrastructure/climbers.repository";
import * as loot from "~/modules/run/community/infrastructure/loot.repository";
import { dispatchRunActionService } from "~/modules/run/run/application/run.service";
import { started } from "~/modules/run/run/domain/run.factory";
import type { RunState } from "~/modules/run/run/domain/run.model";
import * as runs from "~/modules/run/run/infrastructure/run.repository";
import type { RunTx } from "~/modules/run/run/infrastructure/run.repository";
import { createMockRunRecord } from "~/test/runRecord.factory";
import { createMockRunView } from "~/test/runView.factory";

vi.mock("~/modules/run/run/infrastructure/run.repository", () => ({
	findActiveSessionRun: vi.fn(),
}));

vi.mock("~/modules/run/community/infrastructure/climbers.repository", () => ({
	fetchFallenRun: vi.fn(),
}));

vi.mock("~/modules/run/community/infrastructure/loot.repository", () => ({
	ALREADY_LOOTED: "Somebody got to that run first",
	claimFallenRun: vi.fn(),
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

const MISTY = "misty";
const ASH = "ash";
const DATE = "2026-09-22";
const FALLEN_RUN_ID = 11;
const HELD_KB = 130;
const UNBANKED_KB = 100;

const LIVE_RUN = createMockRunRecord({ id: 64, user_id: MISTY });

const tx = {} as unknown as RunTx;

const corpse = (over: Partial<FallenRow> = {}): FallenRow => ({
	runId: FALLEN_RUN_ID,
	userId: ASH,
	displayName: "Ash",
	photoUrl: null,
	borderUrl: null,
	gate: 3,
	pollsIntoGate: 2,
	build: { configs: [] },
	closingBand: null,
	startedAtGate: 0,
	handle: null,
	titles: [],
	theme: "gate-pallet",
	coverageUnits: 0,
	streak: 0,
	storageKb: HELD_KB,
	closes: [],
	auditSchedule: {},
	warmBootKb: 0,
	lootedById: null,
	lootedByName: null,
	lootedKb: null,
	...over,
});

const take = () =>
	lootFallenRunService({
		userId: MISTY,
		date: DATE,
		fallenRunId: FALLEN_RUN_ID,
	});

const refusalOf = async () => {
	const result = await take();
	expect(result.success).toBe(false);
	return result.success ? "" : result.error;
};

describe("lootFallenRunService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(LIVE_RUN);
		vi.mocked(climbers.fetchFallenRun).mockResolvedValue(corpse());
		vi.mocked(dispatchRunActionService).mockResolvedValue({
			success: true,
			data: createMockRunView(),
		});
	});

	it("takes the run's unbanked remainder into the looter's balance", async () => {
		const result = await take();

		expect(result.success).toBe(true);
		expect(dispatchRunActionService).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: MISTY,
				date: DATE,
				action: { type: "loot", kb: UNBANKED_KB },
			})
		);
	});

	it("quotes what was actually taken once a run has been looted before", async () => {
		vi.mocked(climbers.fetchFallenRun).mockResolvedValue(
			corpse({ lootedKb: 42, lootedById: null })
		);

		await take();

		expect(dispatchRunActionService).toHaveBeenCalledWith(
			expect.objectContaining({ action: { type: "loot", kb: 42 } })
		);
	});

	it("refuses a run that did not fall today", async () => {
		vi.mocked(climbers.fetchFallenRun).mockResolvedValue(null);

		expect(await refusalOf()).toContain("No run fell there");
		expect(dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("refuses the looter's own fallen run", async () => {
		vi.mocked(climbers.fetchFallenRun).mockResolvedValue(
			corpse({ userId: MISTY })
		);

		expect(await refusalOf()).toContain("your own run");
		expect(dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("refuses a run somebody already took", async () => {
		vi.mocked(climbers.fetchFallenRun).mockResolvedValue(
			corpse({ lootedById: "blue", lootedKb: 100 })
		);

		expect(await refusalOf()).toContain("got to that run first");
		expect(dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("refuses a run that banked everything it held", async () => {
		vi.mocked(climbers.fetchFallenRun).mockResolvedValue(
			corpse({ storageKb: 0 })
		);

		expect(await refusalOf()).toContain("banked everything");
		expect(dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("refuses a reader with no run to take it into", async () => {
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(null);

		expect(await refusalOf()).toContain("Start a run");
		expect(dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("claims the corpse inside the run's own transaction", async () => {
		await take();

		const settle = vi
			.mocked(dispatchRunActionService)
			.mock.calls[0][0].settle?.(LIVE_RUN.id);
		if (settle === undefined) throw new Error("no settlement composed");
		const before = started(["js"]);
		await settle(tx, before, { ...before, storage: before.storage + 100 });

		expect(loot.claimFallenRun).toHaveBeenCalledWith(tx, {
			fallenRunId: FALLEN_RUN_ID,
			looterUserId: MISTY,
			kb: UNBANKED_KB,
		});
	});

	it("claims nothing when the reducer credited nothing", async () => {
		await take();

		const settle = vi
			.mocked(dispatchRunActionService)
			.mock.calls[0][0].settle?.(LIVE_RUN.id);
		if (settle === undefined) throw new Error("no settlement composed");
		const before = started(["js"]);
		await settle(tx, before, before);

		expect(loot.claimFallenRun).not.toHaveBeenCalled();
	});
});

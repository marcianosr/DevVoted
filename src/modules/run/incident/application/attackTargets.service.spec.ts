import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAttackTargetsService } from "~/modules/run/incident/application/attackTargets.service";
import type { RivalCandidate } from "~/modules/run/incident/domain/incident.model";
import * as incidents from "~/modules/run/incident/infrastructure/incident.repository";
import { started } from "~/modules/run/run/domain/run.factory";
import * as runs from "~/modules/run/run/infrastructure/run.repository";
import { createMockRunRecord } from "~/test/runRecord.factory";

vi.mock("~/modules/run/run/infrastructure/run.repository", () => ({
	findActiveSessionRun: vi.fn(),
	loadRunState: vi.fn(),
}));

vi.mock("~/modules/run/incident/infrastructure/incident.repository", () => ({
	fetchRivalCandidates: vi.fn().mockResolvedValue([]),
	fetchQueuedByRun: vi.fn().mockResolvedValue(new Map()),
	fetchLastTargetUserId: vi.fn().mockResolvedValue(null),
}));

const USER = "red";
const RUN = createMockRunRecord({ id: 1, user_id: USER });

const strong = (gate: number) => ({
	gate,
	band: "healthy" as const,
	cleared: true,
});
const MISTY_BUILD = {
	configs: [{ id: "cache", label: "Cache", slots: 4, level: 2 }],
	vendorLockedConfigId: "cache",
};
const BARE_BUILD = { configs: [] };

const FIELD: RivalCandidate[] = [
	{
		runId: 2,
		userId: "misty",
		name: "Misty",
		gatesCleared: 6,
		lastClose: strong(5),
		build: MISTY_BUILD,
	},
	{
		runId: 3,
		userId: "brock",
		name: "Brock",
		gatesCleared: 4,
		lastClose: strong(3),
		build: BARE_BUILD,
	},
	{
		runId: 4,
		userId: "erika",
		name: "Erika",
		gatesCleared: 9,
		lastClose: { gate: 8, band: "ok", cleared: true },
		build: BARE_BUILD,
	},
];

const targetsFor = async () => {
	const result = await getAttackTargetsService({ userId: USER });
	if (!result.success) throw new Error(result.error);
	return result.data;
};

describe("getAttackTargetsService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(incidents.fetchRivalCandidates).mockResolvedValue(FIELD);
		vi.mocked(incidents.fetchQueuedByRun).mockResolvedValue(new Map());
		vi.mocked(incidents.fetchLastTargetUserId).mockResolvedValue(null);
	});

	const NOTHING = { heldAudit: null, offers: [], rivalsForOffer: null };

	it("offers nothing without a run, and reads no rival for it", async () => {
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(null);

		expect(await targetsFor()).toEqual(NOTHING);
		expect(incidents.fetchRivalCandidates).not.toHaveBeenCalled();
	});

	it("offers nothing while the hand is empty and the shop dealt none", async () => {
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(RUN);
		vi.mocked(runs.loadRunState).mockResolvedValue(started(["js"]));

		expect(await targetsFor()).toEqual(NOTHING);
		expect(incidents.fetchRivalCandidates).not.toHaveBeenCalled();
	});

	it("deals every eligible rival the audit in hand can reach", async () => {
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(RUN);
		vi.mocked(runs.loadRunState).mockResolvedValue({
			...started(["js"]),
			gatesCleared: 5,
			heldAudit: { auditId: "not-found" },
		});

		const { heldAudit, offers } = await targetsFor();

		expect(heldAudit).toEqual({ auditId: "not-found" });
		expect(offers.map((offer) => offer.name)).toEqual(["Misty"]);
		expect(offers[0].gate).toBe(7);
		expect(offers[0].userId).toBe("misty");
		expect(offers[0].audit.code).toBe(404);
		expect(incidents.fetchLastTargetUserId).toHaveBeenCalledWith(USER);
	});

	it("counts who the shop's offer could reach, without buying it", async () => {
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(RUN);
		vi.mocked(runs.loadRunState).mockResolvedValue({
			...started(["js"]),
			gatesCleared: 5,
			incidentOffer: "not-found",
		});

		const { heldAudit, offers, rivalsForOffer } = await targetsFor();

		expect(heldAudit).toBeNull();
		expect(offers).toEqual([]);
		expect(rivalsForOffer).toBe(1);
	});

	it("counts nobody for an offer too cheap to reach the rivals standing there", async () => {
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(RUN);
		vi.mocked(runs.loadRunState).mockResolvedValue({
			...started(["js"]),
			gatesCleared: 5,
			incidentOffer: "feature-freeze",
		});

		expect((await targetsFor()).rivalsForOffer).toBe(0);
	});

	it("ships the rival's public build and nothing of the config behind it", async () => {
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(RUN);
		vi.mocked(runs.loadRunState).mockResolvedValue({
			...started(["js"]),
			gatesCleared: 5,
			heldAudit: { auditId: "not-found" },
		});

		const { offers } = await targetsFor();

		expect(offers[0].build).toEqual(MISTY_BUILD);
		expect(JSON.stringify(offers)).not.toContain('"description":');
	});
});

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
const DATE = "2026-09-22";
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
	const result = await getAttackTargetsService({ userId: USER, date: DATE });
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

	it("offers nothing without a run, and reads no rival for it", async () => {
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(null);

		expect(await targetsFor()).toEqual({ attack: null, offers: [] });
		expect(incidents.fetchRivalCandidates).not.toHaveBeenCalled();
	});

	it("offers nothing while no attack is armed", async () => {
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(RUN);
		vi.mocked(runs.loadRunState).mockResolvedValue(started(["js"]));

		expect(await targetsFor()).toEqual({ attack: null, offers: [] });
		expect(incidents.fetchRivalCandidates).not.toHaveBeenCalled();
	});

	it("deals the eligible rivals, with the payload count the armed band earns", async () => {
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(RUN);
		vi.mocked(runs.loadRunState).mockResolvedValue({
			...started(["js"]),
			gatesCleared: 5,
			attack: { band: "perfect" },
		});

		const { attack, offers } = await targetsFor();

		expect(attack).toEqual({ band: "perfect" });
		expect(offers.map((offer) => offer.name)).toEqual(["Misty"]);
		expect(offers[0].gate).toBe(7);
		expect(offers[0].gateName).toBe("Marsh");
		expect(offers[0].payloads).toHaveLength(2);
		expect(incidents.fetchLastTargetUserId).toHaveBeenCalledWith(USER);
	});

	it("ships the rival's public build and nothing of the config behind it", async () => {
		vi.mocked(runs.findActiveSessionRun).mockResolvedValue(RUN);
		vi.mocked(runs.loadRunState).mockResolvedValue({
			...started(["js"]),
			gatesCleared: 5,
			attack: { band: "healthy" },
		});

		const { offers } = await targetsFor();

		expect(offers[0].build).toEqual(MISTY_BUILD);
		expect(JSON.stringify(offers)).not.toContain('"description":');
	});
});

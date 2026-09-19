import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGateRunsService } from "~/modules/collection/dex/application/runHistory.service";
import {
	fetchGateRunsByUser,
	type GateRunRow,
} from "~/modules/collection/dex/infrastructure/runHistory.repository";
import type { RunStatus } from "~/modules/run/run/domain/run.model";

vi.mock(
	"~/modules/collection/dex/infrastructure/runHistory.repository",
	() => ({ fetchGateRunsByUser: vi.fn() })
);

const USER = "red-from-pallet-town";

const fetched = vi.mocked(fetchGateRunsByUser);

const climb = (
	gatesCleared: number,
	engineStatus: RunStatus,
	overrides: Partial<GateRunRow> = {}
): GateRunRow => ({
	runId: gatesCleared,
	gatesCleared,
	engineStatus,
	coverage: 12,
	startedAt: new Date("2026-09-11T10:00:00Z"),
	finishedAt: new Date("2026-09-11T12:00:00Z"),
	swatchGates: [0, 1],
	...overrides,
});

const dataFor = async () => {
	const result = await getGateRunsService({ userId: USER });
	if (!result.success) throw new Error(result.error);
	return result.data;
};

const runsFor = async () => (await dataFor()).runs;

describe("getGateRunsService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("calls a dead climb finished, so the gate it stopped at counts as faced", async () => {
		fetched.mockResolvedValue([climb(4, "dead")]);

		expect(await runsFor()).toEqual([{ gatesCleared: 4, finished: true }]);
	});

	it("calls a won climb finished", async () => {
		fetched.mockResolvedValue([climb(13, "won")]);

		expect(await runsFor()).toEqual([{ gatesCleared: 13, finished: true }]);
	});

	// Mid-climb states are all "still playing": the gate in front of you has
	// not been faced yet, whichever screen you are standing on.
	it("leaves a climb still in progress unfinished", async () => {
		fetched.mockResolvedValue([
			climb(2, "answering"),
			climb(5, "rewarding"),
			climb(0, "configuring"),
			climb(7, "awaiting-strip"),
		]);

		expect((await runsFor()).every((run) => !run.finished)).toBe(true);
	});

	it("hands back an empty history rather than failing for a new account", async () => {
		fetched.mockResolvedValue([]);

		expect(await dataFor()).toEqual({ runs: [], history: [] });
	});

	it("lists only ended climbs as history, while the audits tally counts them all", async () => {
		fetched.mockResolvedValue([climb(4, "dead"), climb(2, "answering")]);

		const { runs, history } = await dataFor();

		expect(runs).toHaveLength(2);
		expect(history).toHaveLength(1);
		expect(history[0].heldBy).toBe("Lavender");
	});
});

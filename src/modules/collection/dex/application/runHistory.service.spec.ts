import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGateRunsService } from "~/modules/collection/dex/application/runHistory.service";
import { fetchGateRunsByUser } from "~/modules/collection/dex/infrastructure/runHistory.repository";

vi.mock(
	"~/modules/collection/dex/infrastructure/runHistory.repository",
	() => ({ fetchGateRunsByUser: vi.fn() })
);

const USER = "red-from-pallet-town";

const fetched = vi.mocked(fetchGateRunsByUser);

const runsFor = async () => {
	const result = await getGateRunsService({ userId: USER });
	if (!result.success) throw new Error(result.error);
	return result.data.runs;
};

describe("getGateRunsService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("calls a dead climb finished, so the gate it stopped at counts as faced", async () => {
		fetched.mockResolvedValue([{ gatesCleared: 4, engineStatus: "dead" }]);

		expect(await runsFor()).toEqual([{ gatesCleared: 4, finished: true }]);
	});

	it("calls a won climb finished", async () => {
		fetched.mockResolvedValue([{ gatesCleared: 13, engineStatus: "won" }]);

		expect(await runsFor()).toEqual([{ gatesCleared: 13, finished: true }]);
	});

	// Mid-climb states are all "still playing": the gate in front of you has
	// not been faced yet, whichever screen you are standing on.
	it("leaves a climb still in progress unfinished", async () => {
		fetched.mockResolvedValue([
			{ gatesCleared: 2, engineStatus: "answering" },
			{ gatesCleared: 5, engineStatus: "rewarding" },
			{ gatesCleared: 0, engineStatus: "configuring" },
			{ gatesCleared: 7, engineStatus: "awaiting-strip" },
		]);

		expect((await runsFor()).every((run) => !run.finished)).toBe(true);
	});

	it("hands back an empty history rather than failing for a new account", async () => {
		fetched.mockResolvedValue([]);

		expect(await runsFor()).toEqual([]);
	});
});

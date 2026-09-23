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

describe("getGateRunsService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("hands back an empty history rather than failing for a new account", async () => {
		fetched.mockResolvedValue([]);

		expect(await dataFor()).toEqual({ history: [] });
	});

	it("lists only ended climbs as history", async () => {
		fetched.mockResolvedValue([climb(4, "dead"), climb(2, "answering")]);

		const { history } = await dataFor();

		expect(history).toHaveLength(1);
		expect(history[0].heldBy).toBe("Lavender");
	});
});

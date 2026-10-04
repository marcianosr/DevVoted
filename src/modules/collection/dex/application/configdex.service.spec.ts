import { beforeEach, describe, expect, it, vi } from "vitest";

import { getConfigdexService } from "~/modules/collection/dex/application/configdex.service";
import * as queries from "~/modules/collection/dex/infrastructure/configdex.repository";

vi.mock("~/modules/collection/dex/infrastructure/configdex.repository", () => ({
	fetchConfigUnlocksByUser: vi.fn(),
	fetchObjectiveProgressByUser: vi.fn(),
}));

const USER = "red-from-pallet-town";

describe("getConfigdexService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the account's unlock rows beside its progress counters", async () => {
		vi.mocked(queries.fetchConfigUnlocksByUser).mockResolvedValue([
			{ configId: "js", viaMetric: null },
			{ configId: "telemetry", viaMetric: "community-peeks" },
		]);
		vi.mocked(queries.fetchObjectiveProgressByUser).mockResolvedValue([
			{ metric: "polls-answered", count: 43 },
		]);

		const result = await getConfigdexService({ userId: USER });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.unlocks).toEqual([
				{ configId: "js", viaMetric: null },
				{ configId: "telemetry", viaMetric: "community-peeks" },
			]);
			expect(result.data.progress).toEqual([
				{ metric: "polls-answered", count: 43 },
			]);
		}
		expect(queries.fetchConfigUnlocksByUser).toHaveBeenCalledWith(USER);
		expect(queries.fetchObjectiveProgressByUser).toHaveBeenCalledWith(USER);
	});

	it("wraps a repository failure as an error response", async () => {
		vi.mocked(queries.fetchConfigUnlocksByUser).mockRejectedValue(
			new Error("connection refused")
		);
		vi.mocked(queries.fetchObjectiveProgressByUser).mockResolvedValue([]);

		const result = await getConfigdexService({ userId: USER });

		expect(result.success).toBe(false);
	});
});

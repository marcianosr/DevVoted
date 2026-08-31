import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockRunRecord } from "~/domains/runs/models/run.mock";
import { TEST_DATES } from "~/test/kanto";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { createRun } from "~/modules/run/run/domain/run.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import type { RunState } from "~/modules/run/run/domain/run.model";
import { getUpcomingCategoriesService } from "~/modules/run/run/application/prefetch.service";
import * as runQueries from "~/modules/run/run/infrastructure/run.repository";
import * as pollQueries from "~/modules/run/run/infrastructure/runPolls.repository";

vi.mock("~/modules/run/run/infrastructure/run.repository", () => ({
	findActiveSessionRun: vi.fn(),
	loadRunState: vi.fn(),
}));

vi.mock("~/modules/run/run/infrastructure/runPolls.repository", () => ({
	fetchSeedCategoriesForDate: vi.fn(),
}));

const VIEWER = "misty";

const runWith = (configs: readonly Config[]): RunState => {
	const base = createRun([], []);
	return { ...base, build: { ...base.build, configs } };
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(runQueries.findActiveSessionRun).mockResolvedValue(
		createMockRunRecord({
			id: 151,
			mode: "session",
			seed_date: TEST_DATES.birthday,
		})
	);
	vi.mocked(pollQueries.fetchSeedCategoriesForDate).mockResolvedValue([
		"js",
		"css",
		"java",
		"react",
		"ts",
	]);
});

describe("getUpcomingCategoriesService", () => {
	it("serves tomorrow's categories to a run holding Prefetch", async () => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue(
			runWith([CONFIGS.prefetch])
		);

		const result = await getUpcomingCategoriesService({ userId: VIEWER });

		expect(result).toEqual({
			success: true,
			data: ["js", "css", "java", "react", "ts"],
		});
	});

	it("refuses without the config, and never rolls tomorrow's seed", async () => {
		// Server-side, not UI-side: the categories are the config's whole product,
		// and the early roll is a side effect no free rider should trigger.
		vi.mocked(runQueries.loadRunState).mockResolvedValue(
			runWith([CONFIGS.js, CONFIGS.telemetry])
		);

		const result = await getUpcomingCategoriesService({ userId: VIEWER });

		expect(result.success).toBe(false);
		expect(pollQueries.fetchSeedCategoriesForDate).not.toHaveBeenCalled();
	});

	it("refuses when the viewer has no active run", async () => {
		vi.mocked(runQueries.findActiveSessionRun).mockResolvedValue(null);

		const result = await getUpcomingCategoriesService({ userId: VIEWER });

		expect(result.success).toBe(false);
		expect(runQueries.loadRunState).not.toHaveBeenCalled();
	});
});

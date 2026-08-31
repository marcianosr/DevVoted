import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockRunRecord } from "~/domains/runs/models/run.mock";
import { TEST_DATES } from "~/test/kanto";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { getPollSplitService } from "~/modules/run/community/application/pollSplit.service";
import * as communityQueries from "~/modules/run/community/infrastructure/community.repository";
import * as runQueries from "~/modules/run/run/infrastructure/run.repository";

vi.mock("~/modules/run/community/infrastructure/community.repository", () => ({
	fetchPollSplit: vi.fn(),
}));

vi.mock("~/modules/run/run/infrastructure/run.repository", () => ({
	findActiveSessionRun: vi.fn(),
	loadRunState: vi.fn(),
}));

const VIEWER = "ash";
const POLL_ID = 42;

const POLL: RunPoll = {
	id: String(POLL_ID),
	category: "js",
	question: "Which of these is hoisted?",
	answerType: "single",
	options: [
		{ id: "421", label: "function declaration", correct: true },
		{ id: "422", label: "const", correct: false },
	],
};

const runWith = ({
	configs,
	peekedPollIds,
}: {
	configs: readonly Config[];
	peekedPollIds: readonly string[];
}): RunState => {
	const base = createRun([POLL], []);
	return {
		...base,
		build: { ...base.build, configs },
		peekedPollIds,
	};
};

const SPLIT_RECORD = {
	answeredCount: 20,
	picksByOptionId: { 421: 15, 422: 5 },
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(runQueries.findActiveSessionRun).mockResolvedValue(
		createMockRunRecord({
			id: 64,
			mode: "session",
			seed_date: TEST_DATES.birthday,
		})
	);
	vi.mocked(communityQueries.fetchPollSplit).mockResolvedValue(SPLIT_RECORD);
});

describe("getPollSplitService", () => {
	it("serves the split for a poll the run has paid a peek on", async () => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue(
			runWith({
				configs: [CONFIGS.telemetry],
				peekedPollIds: [String(POLL_ID)],
			})
		);

		const result = await getPollSplitService({
			userId: VIEWER,
			pollId: POLL_ID,
		});

		expect(result).toEqual({
			success: true,
			data: { percentByOptionId: { 421: 75, 422: 25 } },
		});
	});

	it("refuses a poll no peek was paid for, and never queries the community", async () => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue(
			runWith({ configs: [CONFIGS.telemetry], peekedPollIds: [] })
		);

		const result = await getPollSplitService({
			userId: VIEWER,
			pollId: POLL_ID,
		});

		expect(result.success).toBe(false);
		expect(communityQueries.fetchPollSplit).not.toHaveBeenCalled();
	});

	it("withholds the sample size while Telemetry is level 1", async () => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue(
			runWith({
				configs: [CONFIGS.telemetry],
				peekedPollIds: [String(POLL_ID)],
			})
		);

		const result = await getPollSplitService({
			userId: VIEWER,
			pollId: POLL_ID,
		});

		// Not merely hidden in the UI: the number never reaches the client, so the
		// L1 blindness survives a devtools tab.
		expect(result.success && result.data).not.toHaveProperty("answeredCount");
	});

	it("sends the sample size once Telemetry is level 2", async () => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue(
			runWith({
				configs: [{ ...CONFIGS.telemetry, level: 2 }],
				peekedPollIds: [String(POLL_ID)],
			})
		);

		const result = await getPollSplitService({
			userId: VIEWER,
			pollId: POLL_ID,
		});

		expect(result.success && result.data.answeredCount).toBe(20);
	});

	it("refuses once the config that reads the community has been peeled", async () => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue(
			runWith({ configs: [CONFIGS.js], peekedPollIds: [String(POLL_ID)] })
		);

		const result = await getPollSplitService({
			userId: VIEWER,
			pollId: POLL_ID,
		});

		expect(result.success).toBe(false);
	});

	it("refuses when the viewer has no active run", async () => {
		vi.mocked(runQueries.findActiveSessionRun).mockResolvedValue(null);

		const result = await getPollSplitService({
			userId: VIEWER,
			pollId: POLL_ID,
		});

		expect(result.success).toBe(false);
		expect(runQueries.loadRunState).not.toHaveBeenCalled();
	});
});

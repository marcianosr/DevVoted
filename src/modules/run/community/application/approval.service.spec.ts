import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockRunRecord } from "~/test/runRecord.factory";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	createRun,
	scheduleOf,
	type RunState,
} from "~/modules/run/run/domain/run.model";
import {
	getApprovalSlotsService,
	submitCrowdPickService,
} from "~/modules/run/community/application/approval.service";
import * as communityQueries from "~/modules/run/community/infrastructure/community.repository";
import * as runQueries from "~/modules/run/run/infrastructure/run.repository";
import * as runService from "~/modules/run/run/application/run.service";

vi.mock("~/modules/run/community/infrastructure/community.repository", () => ({
	fetchApprovalCounts: vi.fn(),
	fetchPollSplit: vi.fn(),
}));

vi.mock("~/modules/run/run/infrastructure/run.repository", () => ({
	findActiveSessionRun: vi.fn(),
	loadRunState: vi.fn(),
}));

vi.mock("~/modules/run/run/application/run.service", () => ({
	dispatchRunActionService: vi.fn(),
}));

const VIEWER = "ash";
const TODAY = "2026-09-27";

const pollAt = (index: number): RunPoll => ({
	id: String(100 + index),
	category: "js",
	question: `Question ${index}`,
	answerType: "single",
	options: [
		{ id: `${100 + index}1`, label: "yes", correct: true },
		{ id: `${100 + index}2`, label: "no", correct: false },
	],
});

const POLLS = [0, 1, 2, 3, 4].map(pollAt);

const runWith = (configs: readonly Config[]): RunState => {
	const base = createRun(POLLS, []);
	return { ...base, build: { ...base.build, configs } };
};

const answering = (approvedPollId?: string): RunState => ({
	...runWith([CONFIGS.lgtm]),
	status: "answering",
	...(approvedPollId === undefined ? {} : { approvedPollId }),
});

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(runQueries.findActiveSessionRun).mockResolvedValue(
		createMockRunRecord({ id: 1, user_id: VIEWER })
	);
});

describe("getApprovalSlotsService", () => {
	beforeEach(() => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue(
			runWith([CONFIGS.lgtm])
		);
	});

	it("marks a slot ready once two people have answered it honestly", async () => {
		vi.mocked(communityQueries.fetchApprovalCounts).mockResolvedValue({
			100: 2,
			101: 9,
			102: 1,
		});

		const result = await getApprovalSlotsService({ userId: VIEWER });

		expect(result.success && result.data).toEqual({
			slots: [
				{ pollId: "100", category: "js", ready: true },
				{ pollId: "101", category: "js", ready: true },
				{ pollId: "102", category: "js", ready: false },
				{ pollId: "103", category: "js", ready: false },
				{ pollId: "104", category: "js", ready: false },
			],
			refusal: null,
		});
	});

	it("hands over readiness without the count, which Telemetry sells", async () => {
		vi.mocked(communityQueries.fetchApprovalCounts).mockResolvedValue({
			100: 137,
		});

		const result = await getApprovalSlotsService({ userId: VIEWER });

		expect(JSON.stringify(result)).not.toContain("137");
	});

	it("offers nothing when no config in the build approves", async () => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue(runWith([CONFIGS.js]));

		const result = await getApprovalSlotsService({ userId: VIEWER });

		expect(result.success && result.data).toEqual({
			slots: [],
			refusal: "offline",
		});
		expect(communityQueries.fetchApprovalCounts).not.toHaveBeenCalled();
	});

	it("offers nothing under the mirror, which inverts what a majority means", async () => {
		const state = runWith([CONFIGS.lgtm]);
		vi.mocked(runQueries.loadRunState).mockResolvedValue({
			...state,
			auditSchedule: { ...scheduleOf(state), 0: ["mirrored"] },
		});

		const result = await getApprovalSlotsService({ userId: VIEWER });

		expect(result.success && result.data.refusal).toBe("mirrored");
		expect(result.success && result.data.slots).toHaveLength(5);
		expect(communityQueries.fetchApprovalCounts).not.toHaveBeenCalled();
	});

	it("names no slot at all once the window is open", async () => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue({
			...runWith([CONFIGS.lgtm]),
			status: "answering",
		});

		const result = await getApprovalSlotsService({ userId: VIEWER });

		expect(result.success && result.data).toEqual({
			slots: [],
			refusal: null,
		});
	});
});

describe("submitCrowdPickService", () => {
	it("answers with every option a majority of the room picked", async () => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue(answering("100"));
		vi.mocked(communityQueries.fetchPollSplit).mockResolvedValue({
			answeredCount: 10,
			picksByOptionId: { 1001: 8, 1002: 2 },
		});

		await submitCrowdPickService({ userId: VIEWER, date: TODAY });

		expect(runService.dispatchRunActionService).toHaveBeenCalledWith({
			userId: VIEWER,
			date: TODAY,
			action: { type: "answer", optionIds: ["1001"] },
		});
	});

	it("refuses a poll the player never approved", async () => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue(answering());

		const result = await submitCrowdPickService({
			userId: VIEWER,
			date: TODAY,
		});

		expect(result.success).toBe(false);
		expect(communityQueries.fetchPollSplit).not.toHaveBeenCalled();
		expect(runService.dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("refuses the slot standing ahead of the one on screen", async () => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue(answering("102"));

		const result = await submitCrowdPickService({
			userId: VIEWER,
			date: TODAY,
		});

		expect(result.success).toBe(false);
		expect(runService.dispatchRunActionService).not.toHaveBeenCalled();
	});

	it("refuses a poll still short of its two approvals", async () => {
		vi.mocked(runQueries.loadRunState).mockResolvedValue(answering("100"));
		vi.mocked(communityQueries.fetchPollSplit).mockResolvedValue({
			answeredCount: 1,
			picksByOptionId: { 1001: 1 },
		});

		const result = await submitCrowdPickService({
			userId: VIEWER,
			date: TODAY,
		});

		expect(result.success).toBe(false);
		expect(runService.dispatchRunActionService).not.toHaveBeenCalled();
	});
});

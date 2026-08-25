import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockRunRecord } from "~/domains/runs/models/run.mock";
import { KANTO_QUIZ, TEST_DATES } from "~/test/kanto";

import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import { toRunSnapshot } from "~/modules/run/run/domain/runSnapshot.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	abandonRunService,
	dispatchRunActionService,
	getTodaysRunService,
	startRunService,
} from "~/modules/run/run/application/run.service";
import * as queries from "~/modules/run/run/infrastructure/run.repository";
import * as pollQueries from "~/modules/run/run/infrastructure/runPolls.repository";

vi.mock("~/modules/run/run/infrastructure/run.repository", () => ({
	abandonSessionRun: vi.fn(),
	applyActionToRun: vi.fn(),
	consumePinnedGate: vi.fn().mockResolvedValue(0),
	createSessionRunWithState: vi.fn(),
	ensureTodaysSegment: vi.fn(),
	fetchAnsweredPollIdsForDay: vi.fn(),
	loadRunState: vi.fn(),
	fetchRunSnapshot: vi.fn(),
	findActiveSessionRun: vi.fn(),
	findSessionRunByDate: vi.fn(),
}));

vi.mock("~/modules/run/run/infrastructure/runPolls.repository", () => ({
	fetchRunPollsForDate: vi.fn(),
}));

const kantoPoll = (index: number): RunPoll => {
	const quiz = KANTO_QUIZ[index % KANTO_QUIZ.length];
	return {
		id: `${index}`,
		category: "js",
		question: quiz.question,
		answerType: "single",
		options: quiz.options.map((label, optionIndex) => ({
			id: `${index}-${optionIndex}`,
			label,
			correct: label === quiz.correctAnswer,
		})),
	};
};

const POLLS = [kantoPoll(0), kantoPoll(1)];
const USER = "red-from-pallet-town";
const DATE = TEST_DATES.birthday;

const sessionRunRecord = (
	overrides: Partial<Parameters<typeof createMockRunRecord>[0]> = {}
) =>
	createMockRunRecord({
		id: 64,
		mode: "session",
		seed_date: TEST_DATES.christmasEve,
		...overrides,
	});

const configuringState = (): RunState =>
	createRun(POLLS, [CONFIGS.js, CONFIGS.eslint]);

describe("getTodaysRunService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns null when the user has no active run and none started today", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(null);

		const result = await getTodaysRunService({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toBeNull();
	});

	it("continues a run started on an earlier day, rolled over to today's segment", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.fetchRunSnapshot).mockResolvedValue(
			toRunSnapshot(configuringState())
		);
		vi.mocked(queries.loadRunState).mockResolvedValue(configuringState());

		const result = await getTodaysRunService({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) expect(result.data?.status).toBe("configuring");
		// Seeding today's sequence is the rollover's own business now, so the
		// service only has to ask for it once (DVTD-5n9l).
		expect(queries.ensureTodaysSegment).toHaveBeenCalledWith(64, DATE);
		expect(queries.loadRunState).toHaveBeenCalledWith(64);
	});

	it("surfaces a finished run started today without rolling it over", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(
			sessionRunRecord({
				seed_date: DATE,
				status: "finished",
				completion_reason: "victory",
			})
		);
		vi.mocked(queries.fetchRunSnapshot).mockResolvedValue(
			toRunSnapshot({ ...configuringState(), status: "won" })
		);
		vi.mocked(queries.loadRunState).mockResolvedValue({
			...configuringState(),
			status: "won",
		});

		const result = await getTodaysRunService({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) expect(result.data?.status).toBe("won");
		expect(queries.ensureTodaysSegment).not.toHaveBeenCalled();
	});

	it("shows the start screen (null) when today's latest run was abandoned", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(
			sessionRunRecord({
				seed_date: DATE,
				status: "finished",
				completion_reason: "abandoned",
			})
		);

		const result = await getTodaysRunService({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toBeNull();
	});

	it("self-heals an active run whose state row is missing instead of bricking", async () => {
		// Corrupt run (seen on dev): abandon it for nothing and show the start
		// screen, rather than erroring on every request forever.
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.fetchRunSnapshot).mockResolvedValue(null);
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(null);

		const result = await getTodaysRunService({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toBeNull();
		expect(queries.abandonSessionRun).toHaveBeenCalledWith(64, USER);
	});
});

describe("startRunService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("resumes the run in progress instead of starting a new one", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.fetchRunSnapshot).mockResolvedValue(
			toRunSnapshot(configuringState())
		);
		vi.mocked(queries.loadRunState).mockResolvedValue(configuringState());

		const result = await startRunService({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		expect(queries.ensureTodaysSegment).toHaveBeenCalledWith(64, DATE);
		expect(queries.createSessionRunWithState).not.toHaveBeenCalled();
	});

	it("seeds the day and creates a run in configuring status", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
		vi.mocked(queries.fetchAnsweredPollIdsForDay).mockResolvedValue(new Set());
		vi.mocked(pollQueries.fetchRunPollsForDate).mockResolvedValue(POLLS);
		vi.mocked(queries.createSessionRunWithState).mockResolvedValue({
			runId: 64,
		});

		const result = await startRunService({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) expect(result.data.status).toBe("configuring");
		expect(queries.createSessionRunWithState).toHaveBeenCalledWith(
			USER,
			DATE,
			expect.objectContaining({ status: "configuring", polls: POLLS })
		);
	});

	it("starts a same-day rerun from today's seed minus already-answered polls", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
		// POLLS[0] has engine id "0" — answered in the abandoned run this morning.
		vi.mocked(queries.fetchAnsweredPollIdsForDay).mockResolvedValue(
			new Set([0])
		);
		vi.mocked(pollQueries.fetchRunPollsForDate).mockResolvedValue(POLLS);
		vi.mocked(queries.createSessionRunWithState).mockResolvedValue({
			runId: 65,
		});

		const result = await startRunService({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		expect(queries.createSessionRunWithState).toHaveBeenCalledWith(
			USER,
			DATE,
			expect.objectContaining({ polls: [POLLS[1]] })
		);
	});

	it("errors when every poll of the day is already answered", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
		vi.mocked(queries.fetchAnsweredPollIdsForDay).mockResolvedValue(
			new Set([0, 1])
		);
		vi.mocked(pollQueries.fetchRunPollsForDate).mockResolvedValue(POLLS);

		const result = await startRunService({ userId: USER, date: DATE });

		expect(result.success).toBe(false);
		expect(queries.createSessionRunWithState).not.toHaveBeenCalled();
	});
});

describe("abandonRunService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("abandons the active run", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
			sessionRunRecord()
		);

		const result = await abandonRunService({ userId: USER });

		expect(result.success).toBe(true);
		expect(queries.abandonSessionRun).toHaveBeenCalledWith(64, USER);
	});

	it("errors when there is nothing to abandon", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);

		const result = await abandonRunService({ userId: USER });

		expect(result.success).toBe(false);
		expect(queries.abandonSessionRun).not.toHaveBeenCalled();
	});
});

describe("dispatchRunActionService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("errors when there is no active run", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);

		const result = await dispatchRunActionService({
			userId: USER,
			date: DATE,
			action: { type: "start" },
		});

		expect(result.success).toBe(false);
		expect(queries.applyActionToRun).not.toHaveBeenCalled();
	});

	it("dispatches to the engine with today's date and returns the next view", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.applyActionToRun).mockResolvedValue({
			...configuringState(),
			status: "answering",
		});

		const result = await dispatchRunActionService({
			userId: USER,
			date: DATE,
			action: { type: "start" },
		});

		expect(result.success).toBe(true);
		if (result.success) expect(result.data.status).toBe("answering");
		expect(queries.applyActionToRun).toHaveBeenCalledWith({
			runId: 64,
			userId: USER,
			today: DATE,
			action: { type: "start" },
		});
	});

	it("never leaks option correctness to the client", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.applyActionToRun).mockResolvedValue({
			...configuringState(),
			status: "answering",
		});

		const result = await dispatchRunActionService({
			userId: USER,
			date: DATE,
			action: { type: "start" },
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.poll?.options.length).toBeGreaterThan(0);
			expect(JSON.stringify(result.data)).not.toContain('"correct":');
		}
	});
});

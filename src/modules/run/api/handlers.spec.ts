import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockRunRecord } from "~/domains/runs/models/run.mock";
import { KANTO_QUIZ, TEST_DATES } from "~/test/kanto";

import { createRun, type RunPoll, type RunState } from "../climb/run.model";
import { toRunSnapshot } from "../climb/runSnapshot.model";
import { CONFIGS } from "../configs/configRoster.model";
import {
	abandonRunHandler,
	dispatchRunActionHandler,
	getTodaysRunHandler,
	startRunHandler,
} from "./handlers";
import * as queries from "./queries";

vi.mock("./queries", () => ({
	abandonSessionRun: vi.fn(),
	applyActionToRun: vi.fn(),
	createSessionRunWithState: vi.fn(),
	ensureTodaysSegment: vi.fn(),
	fetchAnsweredPollIdsForDay: vi.fn(),
	fetchRunPollsForDate: vi.fn(),
	fetchRunPollsForRun: vi.fn(),
	fetchRunSnapshot: vi.fn(),
	findActiveSessionRun: vi.fn(),
	findSessionRunByDate: vi.fn(),
	getOrCreateDailyRunSeed: vi.fn(),
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
	createRun(POLLS, [CONFIGS.js, CONFIGS.eslint], [CONFIGS.unitTests]);

describe("getTodaysRunHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns null when the user has no active run and none started today", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(null);

		const result = await getTodaysRunHandler({ userId: USER, date: DATE });

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
		vi.mocked(queries.fetchRunPollsForRun).mockResolvedValue(POLLS);

		const result = await getTodaysRunHandler({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) expect(result.data?.status).toBe("configuring");
		expect(queries.getOrCreateDailyRunSeed).toHaveBeenCalledWith(DATE);
		expect(queries.ensureTodaysSegment).toHaveBeenCalledWith(64, DATE);
		expect(queries.fetchRunPollsForRun).toHaveBeenCalledWith(64);
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
		vi.mocked(queries.fetchRunPollsForRun).mockResolvedValue(POLLS);

		const result = await getTodaysRunHandler({ userId: USER, date: DATE });

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

		const result = await getTodaysRunHandler({ userId: USER, date: DATE });

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

		const result = await getTodaysRunHandler({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toBeNull();
		expect(queries.abandonSessionRun).toHaveBeenCalledWith(64, USER);
	});
});

describe("startRunHandler", () => {
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
		vi.mocked(queries.fetchRunPollsForRun).mockResolvedValue(POLLS);

		const result = await startRunHandler({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		expect(queries.ensureTodaysSegment).toHaveBeenCalledWith(64, DATE);
		expect(queries.createSessionRunWithState).not.toHaveBeenCalled();
	});

	it("seeds the day and creates a run in configuring status", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
		vi.mocked(queries.getOrCreateDailyRunSeed).mockResolvedValue([1, 2]);
		vi.mocked(queries.fetchAnsweredPollIdsForDay).mockResolvedValue(new Set());
		vi.mocked(queries.fetchRunPollsForDate).mockResolvedValue(POLLS);
		vi.mocked(queries.createSessionRunWithState).mockResolvedValue({
			runId: 64,
		});

		const result = await startRunHandler({ userId: USER, date: DATE });

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
		vi.mocked(queries.getOrCreateDailyRunSeed).mockResolvedValue([0, 1]);
		// POLLS[0] has engine id "0" — answered in the abandoned run this morning.
		vi.mocked(queries.fetchAnsweredPollIdsForDay).mockResolvedValue(
			new Set([0])
		);
		vi.mocked(queries.fetchRunPollsForDate).mockResolvedValue(POLLS);
		vi.mocked(queries.createSessionRunWithState).mockResolvedValue({
			runId: 65,
		});

		const result = await startRunHandler({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		expect(queries.createSessionRunWithState).toHaveBeenCalledWith(
			USER,
			DATE,
			expect.objectContaining({ polls: [POLLS[1]] })
		);
	});

	it("errors when every poll of the day is already answered", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
		vi.mocked(queries.getOrCreateDailyRunSeed).mockResolvedValue([0, 1]);
		vi.mocked(queries.fetchAnsweredPollIdsForDay).mockResolvedValue(
			new Set([0, 1])
		);
		vi.mocked(queries.fetchRunPollsForDate).mockResolvedValue(POLLS);

		const result = await startRunHandler({ userId: USER, date: DATE });

		expect(result.success).toBe(false);
		expect(queries.createSessionRunWithState).not.toHaveBeenCalled();
	});
});

describe("abandonRunHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("abandons the active run", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
			sessionRunRecord()
		);

		const result = await abandonRunHandler({ userId: USER });

		expect(result.success).toBe(true);
		expect(queries.abandonSessionRun).toHaveBeenCalledWith(64, USER);
	});

	it("errors when there is nothing to abandon", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);

		const result = await abandonRunHandler({ userId: USER });

		expect(result.success).toBe(false);
		expect(queries.abandonSessionRun).not.toHaveBeenCalled();
	});
});

describe("dispatchRunActionHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("errors when there is no active run", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);

		const result = await dispatchRunActionHandler({
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

		const result = await dispatchRunActionHandler({
			userId: USER,
			date: DATE,
			action: { type: "start" },
		});

		expect(result.success).toBe(true);
		if (result.success) expect(result.data.status).toBe("answering");
		expect(queries.getOrCreateDailyRunSeed).toHaveBeenCalledWith(DATE);
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

		const result = await dispatchRunActionHandler({
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

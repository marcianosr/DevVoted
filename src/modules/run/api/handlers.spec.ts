import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockRunRecord } from "~/domains/runs/models/run.mock";
import { KANTO_QUIZ, TEST_DATES } from "~/test/kanto";

import { createRun, type RunPoll, type RunState } from "../climb/run.model";
import { toRunSnapshot } from "../climb/runSnapshot.model";
import { CONFIGS } from "../configs/configRoster.model";
import {
	dispatchRunActionHandler,
	getTodaysRunHandler,
	startRunHandler,
} from "./handlers";
import * as queries from "./queries";

vi.mock("./queries", () => ({
	applyActionToRun: vi.fn(),
	createSessionRunWithState: vi.fn(),
	fetchRunPollsForDate: vi.fn(),
	fetchRunSnapshot: vi.fn(),
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

const sessionRunRecord = () =>
	createMockRunRecord({ id: 64, mode: "session", seed_date: DATE });

const configuringState = (): RunState =>
	createRun(POLLS, [CONFIGS.js, CONFIGS.eslint], [CONFIGS.unitTests]);

describe("getTodaysRunHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns null when the user has no run today", async () => {
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(null);

		const result = await getTodaysRunHandler({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toBeNull();
	});

	it("rehydrates and returns the redacted view of an existing run", async () => {
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.fetchRunSnapshot).mockResolvedValue(
			toRunSnapshot(configuringState())
		);
		vi.mocked(queries.fetchRunPollsForDate).mockResolvedValue(POLLS);

		const result = await getTodaysRunHandler({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data?.status).toBe("configuring");
			expect(queries.fetchRunPollsForDate).toHaveBeenCalledWith(DATE);
		}
	});

	it("errors when the run exists but its state row is missing", async () => {
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.fetchRunSnapshot).mockResolvedValue(null);

		const result = await getTodaysRunHandler({ userId: USER, date: DATE });

		expect(result.success).toBe(false);
	});
});

describe("startRunHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the existing climb instead of starting twice on one day", async () => {
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.fetchRunSnapshot).mockResolvedValue(
			toRunSnapshot(configuringState())
		);
		vi.mocked(queries.fetchRunPollsForDate).mockResolvedValue(POLLS);

		const result = await startRunHandler({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		expect(queries.createSessionRunWithState).not.toHaveBeenCalled();
	});

	it("seeds the day and creates a run in configuring status", async () => {
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(null);
		vi.mocked(queries.getOrCreateDailyRunSeed).mockResolvedValue([1, 2]);
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

	it("errors when the day has no seeded polls", async () => {
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(null);
		vi.mocked(queries.getOrCreateDailyRunSeed).mockResolvedValue([]);
		vi.mocked(queries.fetchRunPollsForDate).mockResolvedValue([]);

		const result = await startRunHandler({ userId: USER, date: DATE });

		expect(result.success).toBe(false);
		expect(queries.createSessionRunWithState).not.toHaveBeenCalled();
	});
});

describe("dispatchRunActionHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("errors when no run was started today", async () => {
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(null);

		const result = await dispatchRunActionHandler({
			userId: USER,
			date: DATE,
			action: { type: "start" },
		});

		expect(result.success).toBe(false);
		expect(queries.applyActionToRun).not.toHaveBeenCalled();
	});

	it("dispatches to the engine and returns the next view", async () => {
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(
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
		expect(queries.applyActionToRun).toHaveBeenCalledWith({
			runId: 64,
			userId: USER,
			seedDate: DATE,
			action: { type: "start" },
		});
	});

	it("never leaks option correctness to the client", async () => {
		vi.mocked(queries.findSessionRunByDate).mockResolvedValue(
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

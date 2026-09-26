import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockRunRecord } from "~/test/runRecord.factory";
import { KANTO_QUIZ, TEST_DATES } from "~/test/kanto";

import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import { toRunSnapshot } from "~/modules/run/run/domain/runSnapshot.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	abandonRunService,
	dispatchRunActionService,
	getRunRecapService,
	getTodaysRunService,
	startRunService,
} from "~/modules/run/run/application/run.service";
import * as queries from "~/modules/run/run/infrastructure/run.repository";
import * as pollQueries from "~/modules/run/run/infrastructure/runPolls.repository";
import * as unlockQueries from "~/modules/run/config/infrastructure/configUnlock.repository";
import * as leaderQueries from "~/modules/run/run/infrastructure/categoryLeader.repository";
import * as statsQueries from "~/modules/run/run/infrastructure/pollStats.repository";

vi.mock("~/modules/run/run/infrastructure/run.repository", () => ({
	abandonSessionRun: vi.fn(),
	applyActionToRun: vi.fn(),
	consumePinnedGate: vi.fn().mockResolvedValue(0),
	createSessionRunWithState: vi.fn(),
	ensureTodaysSegment: vi.fn(),
	fetchAnsweredPollIdsForDay: vi.fn(),
	fetchArchivedStorageKb: vi.fn().mockResolvedValue(0),
	fetchStorageWatermark: vi.fn().mockResolvedValue(0),
	loadRunState: vi.fn(),
	fetchRunSnapshot: vi.fn(),
	findActiveSessionRun: vi.fn(),
	findSessionRunByDate: vi.fn(),
	findSessionRunById: vi.fn(),
}));

vi.mock("~/modules/run/run/infrastructure/runPolls.repository", () => ({
	fetchRunPollsForDate: vi.fn(),
}));

vi.mock("~/modules/run/run/infrastructure/pollStats.repository", () => ({
	fetchPollStats: vi.fn().mockResolvedValue({
		firstAttempts: 0,
		firstAttemptsRight: 0,
		attempts: 0,
		misses: 0,
	}),
}));

vi.mock("~/modules/run/run/infrastructure/categoryLeader.repository", () => ({
	fetchCategoryLeader: vi.fn().mockResolvedValue({ category: "js" }),
}));

vi.mock("~/modules/run/incident/infrastructure/incident.repository", () => ({
	endIncidentsForRun: vi.fn(),
}));

vi.mock(
	"~/modules/run/incident/application/incidentSettlement.service",
	() => ({ settleIncidents: vi.fn(() => vi.fn()) })
);

vi.mock("~/modules/run/shop/infrastructure/serviceUnlock.repository", () => ({
	fetchUnlockedServiceIds: vi.fn().mockResolvedValue([]),
}));

vi.mock("~/modules/run/config/infrastructure/configUnlock.repository", () => ({
	fetchUnlocksSince: vi.fn().mockResolvedValue([]),
	fetchUnlockedConfigIds: vi.fn().mockResolvedValue([]),
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

const answeringState = (): RunState => {
	const configs = [CONFIGS.js, CONFIGS.eslint];
	const installed = configs.reduce(
		(state, config) =>
			runReducer(state, { type: "install", configId: config.id }),
		createRun(POLLS, configs)
	);

	return runReducer(installed, { type: "start" });
};

describe("getRunRecapService (DVTD-t3lt: the archive's one id-bearing URL)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("reads a run this account owns", async () => {
		vi.mocked(queries.findSessionRunById).mockResolvedValue(
			sessionRunRecord({ user_id: USER })
		);
		vi.mocked(queries.loadRunState).mockResolvedValue(configuringState());

		const result = await getRunRecapService({ userId: USER, runId: 64 });

		expect(result.success).toBe(true);
		if (result.success) expect(result.data.status).toBe("configuring");
	});

	it("refuses a run belonging to someone else, and never reads its state", async () => {
		vi.mocked(queries.findSessionRunById).mockResolvedValue(
			sessionRunRecord({ user_id: "blue-from-pallet-town" })
		);

		const result = await getRunRecapService({ userId: USER, runId: 64 });

		expect(result.success).toBe(false);
		expect(vi.mocked(queries.loadRunState)).not.toHaveBeenCalled();
	});

	it("refuses a run that does not exist, in the same words", async () => {
		vi.mocked(queries.findSessionRunById).mockResolvedValue(null);

		const missing = await getRunRecapService({ userId: USER, runId: 999 });
		vi.mocked(queries.findSessionRunById).mockResolvedValue(
			sessionRunRecord({ user_id: "blue-from-pallet-town" })
		);
		const theirs = await getRunRecapService({ userId: USER, runId: 64 });

		expect(missing.success).toBe(false);
		expect(theirs.success).toBe(false);
		if (!missing.success && !theirs.success)
			expect(missing.error).toBe(theirs.error);
	});
});

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
			expect.objectContaining({
				status: "configuring",
				polls: POLLS,
				build: expect.objectContaining({ configs: [] }),
			})
		);
	});

	it("starts a same-day rerun from today's seed minus already-answered polls", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(null);
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
			state: { ...configuringState(), status: "answering" },
			unlockedConfigIds: [],
			earnedTitleIds: [],
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
			settle: expect.any(Function),
		});
	});

	it("never leaks option correctness to the client", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.applyActionToRun).mockResolvedValue({
			state: { ...configuringState(), status: "answering" },
			unlockedConfigIds: [],
			earnedTitleIds: [],
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

	it("rides newly granted configs and the run's unlock history on the view", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.applyActionToRun).mockResolvedValue({
			state: { ...configuringState(), status: "answering" },
			unlockedConfigIds: ["telemetry"],
			earnedTitleIds: [],
		});
		vi.mocked(unlockQueries.fetchUnlocksSince).mockResolvedValue([
			{ configId: "telemetry", viaMetric: "community-peeks" },
		]);

		const result = await dispatchRunActionService({
			userId: USER,
			date: DATE,
			action: { type: "peek-poll" },
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.unlockedConfigIds).toEqual(["telemetry"]);
			expect(result.data.unlockedThisRun).toEqual([
				{ configId: "telemetry", viaMetric: "community-peeks" },
			]);
		}
	});
});

describe("the poll's own history on the view (ADR-093)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("reads the room's and the account's figures for the poll on screen", async () => {
		vi.mocked(statsQueries.fetchPollStats).mockResolvedValue({
			firstAttempts: 90,
			firstAttemptsRight: 28,
			attempts: 2,
			misses: 2,
			lastAnsweredAt: "2026-08-04T09:00:00.000Z",
		});
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.loadRunState).mockResolvedValue(answeringState());

		const result = await getTodaysRunService({ userId: USER, date: DATE });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data?.poll?.stats).toMatchObject({
				firstAttempts: 90,
				firstAttemptsRight: 28,
				attempts: 2,
				misses: 2,
			});
		}
	});

	it("reads the leader of the poll's own category (ADR-103)", async () => {
		vi.mocked(leaderQueries.fetchCategoryLeader).mockResolvedValue({
			category: "js",
			leader: { handle: "@sabrina", streak: 17, you: false },
		});
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.loadRunState).mockResolvedValue(answeringState());

		const result = await getTodaysRunService({ userId: USER, date: DATE });

		expect(
			vi.mocked(leaderQueries.fetchCategoryLeader).mock.calls[0]?.[0]
		).toBe("js");
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data?.poll?.categorySeat?.leader?.streak).toBe(17);
		}
	});

	it("asks for nothing while no poll is on screen", async () => {
		vi.mocked(queries.findActiveSessionRun).mockResolvedValue(
			sessionRunRecord()
		);
		vi.mocked(queries.loadRunState).mockResolvedValue(configuringState());

		await getTodaysRunService({ userId: USER, date: DATE });

		expect(vi.mocked(statsQueries.fetchPollStats)).not.toHaveBeenCalled();
		expect(vi.mocked(leaderQueries.fetchCategoryLeader)).not.toHaveBeenCalled();
	});
});

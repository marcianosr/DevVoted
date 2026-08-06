import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import {
	pollResponseOptionsTable,
	pollResponsesTable,
	runPollsTable,
} from "~/database/schema";
import { KANTO_QUIZ, TEST_DATES } from "~/test/kanto";

import { createRun, type RunState } from "../climb/run.model";
import { toRunSnapshot } from "../climb/runSnapshot.model";
import { CONFIGS } from "../configs/configRoster.model";
import {
	abandonSessionRun,
	applyActionToRun,
	getOrCreateDailyRunSeed,
} from "./queries";

/**
 * Chainable thenable db mock: every query-builder method returns the chain,
 * awaiting the chain consumes the next queued result. Writes (values/set)
 * record their payloads for assertions. Queue results in the exact order the
 * code under test awaits its queries.
 */
const mock = vi.hoisted(() => ({
	results: [] as unknown[],
	setCalls: [] as Record<string, unknown>[],
	valuesCalls: [] as unknown[],
	insertTables: [] as unknown[],
	updateTables: [] as unknown[],
	deleteTables: [] as unknown[],
}));

vi.mock("~/database/db", () => {
	const makeChain = () => {
		const chain: Record<string, unknown> = {};
		const chainMethods = [
			"from",
			"where",
			"orderBy",
			"limit",
			"innerJoin",
			"returning",
			"onConflictDoNothing",
			"for",
		];
		chainMethods.forEach((method) => {
			chain[method] = vi.fn(() => chain);
		});
		chain.values = vi.fn((payload: unknown) => {
			mock.valuesCalls.push(payload);
			return chain;
		});
		chain.set = vi.fn((payload: Record<string, unknown>) => {
			mock.setCalls.push(payload);
			return chain;
		});
		chain.then = (resolve: (value: unknown) => void) =>
			resolve(mock.results.shift());
		return chain;
	};

	const mockDb = {
		select: vi.fn(() => makeChain()),
		insert: vi.fn((table: unknown) => {
			mock.insertTables.push(table);
			return makeChain();
		}),
		update: vi.fn((table: unknown) => {
			mock.updateTables.push(table);
			return makeChain();
		}),
		delete: vi.fn((table: unknown) => {
			mock.deleteTables.push(table);
			return makeChain();
		}),
		transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
			callback(mockDb)
		),
	};
	return { db: mockDb };
});

const quiz = KANTO_QUIZ[0];
const dbPoll = (id: number) => ({
	id,
	question: quiz.question,
	answerType: "single" as const,
	categoryCode: "js",
});
const dbOptions = (pollId: number) =>
	quiz.options.map((label, index) => ({
		id: pollId * 10 + index,
		poll_id: pollId,
		option: label,
		correct: label === quiz.correctAnswer,
	}));
const correctOptionId = (pollId: number) =>
	String(pollId * 10 + quiz.options.indexOf(quiz.correctAnswer));
const wrongOptionId = (pollId: number) =>
	String(
		pollId * 10 +
			quiz.options.findIndex((label) => label !== quiz.correctAnswer)
	);

const answeringState = (overrides: Partial<RunState>): RunState => ({
	...createRun([], [CONFIGS.js]),
	status: "answering",
	...overrides,
});

const stateRow = (state: RunState) => ({
	run_id: 64,
	state: toRunSnapshot(state),
	engine_status: state.status,
	polls_answered: state.currentIndex,
});

/** Newest run_polls segment row: same-day by default, so no rollover runs. */
const segmentRow = (segment_date: string = TEST_DATES.birthday) => [
	{ segment_date },
];

describe("getOrCreateDailyRunSeed", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mock.results.length = 0;
		mock.setCalls.length = 0;
		mock.valuesCalls.length = 0;
		mock.insertTables.length = 0;
		mock.updateTables.length = 0;
	});

	it("returns the existing sequence without creating anything", async () => {
		mock.results.push([{ poll_id: 7 }, { poll_id: 3 }]);

		const sequence = await getOrCreateDailyRunSeed(TEST_DATES.birthday);

		expect(sequence).toEqual([7, 3]);
		expect(db.insert).not.toHaveBeenCalled();
	});

	it("rolls and persists the sequence when the day has none", async () => {
		const published = [1, 2, 3, 4].map((id) => ({ id }));
		mock.results.push([]); // no existing sequence
		mock.results.push([{ id: 1 }]); // seed row claimed
		mock.results.push(published);
		mock.results.push(undefined); // daily_run_polls insert

		const sequence = await getOrCreateDailyRunSeed(TEST_DATES.birthday);

		expect([...sequence].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
		expect(db.insert).toHaveBeenCalledTimes(2);
		const insertedRows = mock.valuesCalls[1] as { position: number }[];
		expect(insertedRows.map((row) => row.position)).toEqual([0, 1, 2, 3]);
	});

	it("reads the winner's sequence when losing the creation race", async () => {
		mock.results.push([]); // no existing sequence yet
		mock.results.push([]); // claim conflicts — another request won
		mock.results.push([{ poll_id: 9 }, { poll_id: 5 }]);

		const sequence = await getOrCreateDailyRunSeed(TEST_DATES.christmas);

		expect(sequence).toEqual([9, 5]);
		expect(db.insert).toHaveBeenCalledTimes(1);
	});

	it("throws when there are no published polls to seed from", async () => {
		mock.results.push([]);
		mock.results.push([{ id: 1 }]);
		mock.results.push([]);

		await expect(getOrCreateDailyRunSeed(TEST_DATES.christmas)).rejects.toThrow(
			"No published polls"
		);
	});
});

describe("applyActionToRun", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mock.results.length = 0;
		mock.setCalls.length = 0;
		mock.valuesCalls.length = 0;
		mock.insertTables.length = 0;
		mock.updateTables.length = 0;
		mock.deleteTables.length = 0;
	});

	const dispatch = (action: Parameters<typeof applyActionToRun>[0]["action"]) =>
		applyActionToRun({
			runId: 64,
			userId: "red-from-pallet-town",
			today: TEST_DATES.birthday,
			action,
		});

	it("throws when the run state row is missing", async () => {
		mock.results.push([]);

		await expect(dispatch({ type: "start" })).rejects.toThrow(
			"Run state not found"
		);
	});

	it("rejects actions on a finished run", async () => {
		const won = answeringState({});
		mock.results.push([{ ...stateRow(won), engine_status: "won" }]);

		await expect(dispatch({ type: "start" })).rejects.toThrow(
			"Run is already over"
		);
	});

	it("skips persisting when the action is illegal for the current status", async () => {
		mock.results.push([stateRow(answeringState({}))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));

		const next = await dispatch({ type: "draft", configId: "copilot" });

		expect(next.status).toBe("answering");
		expect(db.update).not.toHaveBeenCalled();
	});

	it("persists the reducer output with denormalized columns", async () => {
		mock.results.push([stateRow(answeringState({ storage: 100 }))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ response_id: 900 }]);

		const next = await dispatch({
			type: "answer",
			optionIds: [correctOptionId(1)],
		});

		expect(next.status).toBe("answering");
		expect(next.currentIndex).toBe(1);
		expect(mock.setCalls[0]).toMatchObject({
			engine_status: "answering",
			gates_cleared: 0,
			polls_answered: 1,
		});
		expect(mock.setCalls[0].state).not.toHaveProperty("polls");
	});

	it("finishes the run and credits leftover storage on victory", async () => {
		// One answer from the summit: the final gate's window is 4/5 with every
		// answer correct, so this correct answer closes it and clears gate 5.
		// A bare pipeline can never clear (ADR-017), so the summit build carries
		// its .js config — the window's 4/4 JS record passes its mastery check.
		const summitReady = answeringState({
			storage: 100,
			pipeline: { id: "pipeline", slots: 3, configs: [CONFIGS.js] },
			gatesCleared: 4,
			window: {
				correct: 4,
				answered: 4,
				coverageGained: 4,
				leadingCorrect: 4,
				byCategory: { js: { seen: 4, correct: 4 } },
			},
		});
		mock.results.push([stateRow(summitReady)]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		mock.results.push([{ response_id: 900 }]);

		const next = await dispatch({
			type: "answer",
			optionIds: [correctOptionId(1)],
		});

		expect(next.status).toBe("won");
		expect(mock.setCalls[0]).toMatchObject({ engine_status: "won" });
		expect(mock.setCalls[1]).toMatchObject({
			status: "finished",
			completion_reason: "victory",
		});
		expect(mock.setCalls[1].victory_achieved_at).toBeInstanceOf(Date);
		// 100 KB leftover → bytes credit on users.archived_storage
		expect(mock.setCalls[2]).toHaveProperty("archived_storage");
		expect(db.update).toHaveBeenCalledTimes(3);
	});

	it("keeps the run active when the day's polls run out mid-window (ADR-014)", async () => {
		// Single-poll segment answered mid-window: the old engine called this a
		// win (and cashed out); now the run just waits for tomorrow's polls.
		mock.results.push([stateRow(answeringState({ storage: 100 }))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		mock.results.push([{ response_id: 900 }]);

		const next = await dispatch({
			type: "answer",
			optionIds: [correctOptionId(1)],
		});

		expect(next.status).toBe("answering");
		expect(mock.setCalls[0]).toMatchObject({ engine_status: "answering" });
		// One update only (the state row): no run finish, no storage credit.
		expect(db.update).toHaveBeenCalledTimes(1);
	});

	it("writes the answer as a session polls_responses row with its picked options", async () => {
		mock.results.push([stateRow(answeringState({}))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ response_id: 900 }]);

		await dispatch({ type: "answer", optionIds: [correctOptionId(1)] });

		expect(mock.insertTables).toContain(pollResponsesTable);
		expect(mock.valuesCalls[0]).toMatchObject({
			poll_id: 1,
			user_id: "red-from-pallet-town",
			run_id: 64,
			mode: "session",
			answer_date: TEST_DATES.birthday,
		});
		expect(mock.insertTables).toContain(pollResponseOptionsTable);
		expect(mock.valuesCalls[1]).toEqual([
			{ response_id: 900, option_id: Number(correctOptionId(1)) },
		]);
	});

	it("drops unknown option ids instead of failing the dispatch", async () => {
		// The engine tolerates tampered ids (counts them as a wrong pick), so
		// persistence must not veto an answer the engine already accepted.
		mock.results.push([stateRow(answeringState({}))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ response_id: 900 }]);

		const next = await dispatch({
			type: "answer",
			optionIds: ["missingno"],
		});

		expect(next.currentIndex).toBe(1);
		expect(mock.insertTables).toContain(pollResponsesTable);
		expect(mock.insertTables).not.toContain(pollResponseOptionsTable);
	});

	it("rolls the run over to today's segment when its newest segment is stale", async () => {
		// One poll answered on Christmas Eve; the player returns on the birthday.
		// Rollover drops the unplayed tail and appends today's sequence minus
		// the already-answered poll 1, then the dispatch answers as normal.
		const state = answeringState({
			currentIndex: 1,
			window: {
				correct: 1,
				answered: 1,
				coverageGained: 0,
				leadingCorrect: 1,
				byCategory: { js: { seen: 1, correct: 1 } },
			},
		});
		mock.results.push([stateRow(state)]);
		mock.results.push(segmentRow(TEST_DATES.christmasEve));
		mock.results.push([{ poll_id: 1 }]); // answered in this run
		mock.results.push(undefined); // delete unplayed tail
		mock.results.push([{ poll_id: 1 }, { poll_id: 2 }, { poll_id: 3 }]); // today's seed
		mock.results.push(undefined); // insert appended segment
		mock.results.push([dbPoll(1), dbPoll(2), dbPoll(3)]);
		mock.results.push([1, 2, 3].flatMap(dbOptions));
		mock.results.push([{ response_id: 900 }]);

		const next = await dispatch({
			type: "answer",
			optionIds: [correctOptionId(2)],
		});

		expect(mock.deleteTables).toContain(runPollsTable);
		expect(mock.valuesCalls[0]).toEqual([
			{
				run_id: 64,
				position: 1,
				poll_id: 2,
				segment_date: TEST_DATES.birthday,
			},
			{
				run_id: 64,
				position: 2,
				poll_id: 3,
				segment_date: TEST_DATES.birthday,
			},
		]);
		expect(mock.valuesCalls[1]).toMatchObject({
			poll_id: 2,
			answer_date: TEST_DATES.birthday,
			mode: "session",
		});
		expect(next.currentIndex).toBe(2);
	});

	it("writes no response row for advancing non-answer actions", async () => {
		const base = createRun([], [CONFIGS.js]);
		// Start only fires on a full pipeline, so the fixture fills every slot.
		const configuring = {
			...base,
			pipeline: {
				...base.pipeline,
				configs: [CONFIGS.js, CONFIGS.ts, CONFIGS.css],
			},
			status: "configuring" as const,
		};
		mock.results.push([stateRow(configuring)]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));

		const next = await dispatch({ type: "start" });

		expect(next.status).toBe("answering");
		expect(mock.insertTables).not.toContain(pollResponsesTable);
		expect(db.update).toHaveBeenCalled();
	});

	it("marks a bare-build gate failure as dead without crediting empty storage", async () => {
		const bare = {
			...createRun([], []),
			status: "answering" as const,
			currentIndex: 4,
			window: {
				correct: 0,
				answered: 4,
				coverageGained: 0,
				leadingCorrect: 0,
				byCategory: { js: { seen: 4, correct: 0 } },
			},
		};
		mock.results.push([stateRow(bare)]);
		mock.results.push(segmentRow());
		mock.results.push([1, 2, 3, 4, 5].map(dbPoll));
		mock.results.push([1, 2, 3, 4, 5].flatMap(dbOptions));
		mock.results.push([{ response_id: 900 }]);

		const next = await dispatch({
			type: "answer",
			optionIds: [wrongOptionId(5)],
		});

		expect(next.status).toBe("dead");
		expect(mock.setCalls[1]).toMatchObject({
			status: "finished",
			completion_reason: "dead",
		});
		// storage is 0 — no archived_storage credit, so only run_states + runs updates
		expect(db.update).toHaveBeenCalledTimes(2);
	});
});

describe("abandonSessionRun", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mock.results.length = 0;
		mock.setCalls.length = 0;
		mock.updateTables.length = 0;
	});

	it("finishes the run as abandoned without banking any storage", async () => {
		mock.results.push([
			{ state: toRunSnapshot(answeringState({ storage: 229 })) },
		]);
		mock.results.push([{ id: 64 }]); // runs update matched an active row

		await abandonSessionRun(64, "red-from-pallet-town");

		expect(mock.setCalls[0]).toMatchObject({
			status: "finished",
			completion_reason: "abandoned",
		});
		// 229 KB leftover, all forfeited — abandoning is never a cash-out
		expect(db.update).toHaveBeenCalledTimes(1);
	});

	it("throws when the run is already finished", async () => {
		mock.results.push([{ state: toRunSnapshot(answeringState({})) }]);
		mock.results.push([]); // no active row matched the guarded update

		await expect(abandonSessionRun(64, "red-from-pallet-town")).rejects.toThrow(
			"Run is already over"
		);
	});

	it("abandons a corrupt run (no state row) with zero credit", async () => {
		mock.results.push([]); // state row missing
		mock.results.push([{ id: 64 }]);

		await abandonSessionRun(64, "red-from-pallet-town");

		expect(mock.setCalls[0]).toMatchObject({ completion_reason: "abandoned" });
		expect(db.update).toHaveBeenCalledTimes(1); // no archived_storage credit
	});
});

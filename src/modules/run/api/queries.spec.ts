import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import {
	pollResponseOptionsTable,
	pollResponsesTable,
} from "~/database/schema";
import { KANTO_QUIZ, TEST_DATES } from "~/test/kanto";

import { createRun, type RunState } from "../climb/run.model";
import { toRunSnapshot } from "../climb/runSnapshot.model";
import { CONFIGS } from "../configs/configRoster.model";
import { applyActionToRun, getOrCreateDailyRunSeed } from "./queries";

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
	...createRun([], [CONFIGS.js], [CONFIGS.unitTests]),
	status: "answering",
	...overrides,
});

const stateRow = (state: RunState) => ({
	run_id: 64,
	state: toRunSnapshot(state),
	engine_status: state.status,
});

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
	});

	const dispatch = (action: Parameters<typeof applyActionToRun>[0]["action"]) =>
		applyActionToRun({
			runId: 64,
			userId: "red-from-pallet-town",
			seedDate: TEST_DATES.birthday,
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
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));

		const next = await dispatch({ type: "draft", configId: "copilot" });

		expect(next.status).toBe("answering");
		expect(db.update).not.toHaveBeenCalled();
	});

	it("persists the reducer output with denormalized columns", async () => {
		mock.results.push([stateRow(answeringState({ storage: 100 }))]);
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
		// Single-poll seed: a correct answer exhausts the polls, which the engine treats as won.
		mock.results.push([stateRow(answeringState({ storage: 100 }))]);
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

	it("writes the answer as a session polls_responses row with its picked options", async () => {
		mock.results.push([stateRow(answeringState({}))]);
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

	it("writes no response row for advancing non-answer actions", async () => {
		const configuring = {
			...createRun([], [CONFIGS.js], [CONFIGS.unitTests]),
			status: "configuring" as const,
		};
		mock.results.push([stateRow(configuring)]);
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));

		const next = await dispatch({ type: "start" });

		expect(next.status).toBe("answering");
		expect(mock.insertTables).not.toContain(pollResponsesTable);
		expect(db.update).toHaveBeenCalled();
	});

	it("marks a bare-build gate failure as dead without crediting empty storage", async () => {
		const bare = {
			...createRun([], [], []),
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

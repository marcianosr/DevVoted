import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import {
	pollResponseOptionsTable,
	pollResponsesTable,
	runPollsTable,
	usersTable,
} from "~/database/schema";
import { KANTO_QUIZ, TEST_DATES } from "~/test/kanto";

import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { toRunSnapshot } from "~/modules/run/run/domain/runSnapshot.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	BASE_SLOTS,
	VICTORY_GATE,
	coverageDemandFor,
} from "~/modules/run/run/domain/rules.model";
import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";
import {
	abandonSessionRun,
	applyActionToRun,
	createSessionRunWithState,
} from "~/modules/run/run/infrastructure/run.repository";

const mock = vi.hoisted((): DrizzleMockState => ({
	results: [],
	setCalls: [],
	valuesCalls: [],
	insertTables: [],
	updateTables: [],
	deleteTables: [],
}));

vi.mock("~/database/db", async () => {
	const { createMockDb } = await import("~/test/drizzleMock.factory");
	return { db: createMockDb(mock) };
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

const segmentRow = (segment_date: string = TEST_DATES.birthday) => [
	{ segment_date },
];

describe("applyActionToRun", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	const dispatch = (
		action: Parameters<typeof applyActionToRun>[0]["action"]
	) => {
		mock.results.unshift([{ poll_id: 1 }]);
		return applyActionToRun({
			runId: 64,
			userId: "red-from-pallet-town",
			today: TEST_DATES.birthday,
			action,
		});
	};

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

		const next = await dispatch({ type: "draft", configId: "agents-md" });

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
		const summitReady = answeringState({
			storage: 100,
			coverage: 400,
			build: { id: "build", slots: BASE_SLOTS, configs: [CONFIGS.js] },
			gatesCleared: VICTORY_GATE,
			window: {
				correct: 4,
				answered: 4,
				coverageGained: coverageDemandFor(VICTORY_GATE),
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
		expect(mock.setCalls[0]).toHaveProperty("owned_swatch_ids");
		expect(mock.setCalls[1]).toMatchObject({ engine_status: "won" });
		expect(mock.setCalls[2]).toMatchObject({
			status: "finished",
			completion_reason: "victory",
		});
		expect(mock.setCalls[2].victory_achieved_at).toBeInstanceOf(Date);
		expect(mock.setCalls[3]).toHaveProperty("archived_storage");
		expect(mock.setCalls[4]).toHaveProperty("peak_storage_kb");
		expect(db.update).toHaveBeenCalledTimes(5);
	});

	it("hands out no swatch at run start — Pallet is gate 0's reward", async () => {
		mock.results.push([{ id: 64 }]);
		mock.results.push(undefined);
		mock.results.push(undefined);

		await createSessionRunWithState(
			"red-from-pallet-town",
			TEST_DATES.birthday,
			answeringState({ polls: [] })
		);

		expect(mock.updateTables).not.toContain(usersTable);
	});

	it("earns the cleared gate's swatch, written before the state row", async () => {
		const closing = answeringState({
			coverage: 10,
			build: { id: "build", slots: BASE_SLOTS, configs: [CONFIGS.js] },
			window: {
				correct: 4,
				answered: 4,
				coverageGained: 4,
				byCategory: { js: { seen: 4, correct: 4 } },
			},
		});
		mock.results.push([stateRow(closing)]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		mock.results.push([{ response_id: 900 }]);

		const next = await dispatch({
			type: "answer",
			optionIds: [correctOptionId(1)],
		});

		expect(next.gatesCleared).toBe(1);
		expect(mock.updateTables[0]).toBe(usersTable);
		expect(mock.setCalls[0]).toHaveProperty("owned_swatch_ids");
	});

	it("earns no swatch when the action clears no gate", async () => {
		mock.results.push([stateRow(answeringState({}))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ response_id: 900 }]);

		await dispatch({ type: "answer", optionIds: [correctOptionId(1)] });

		expect(mock.updateTables).not.toContain(usersTable);
	});

	it("keeps the run active when the day's polls run out mid-window (ADR-014)", async () => {
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
		// The state row, plus the account's KB mark: a run loaded without one
		// takes the balance it is already holding as its first mark.
		expect(db.update).toHaveBeenCalledTimes(2);
	});

	it("raises the account's KB mark when the run reaches a new best", async () => {
		mock.results.push([stateRow(answeringState({ storage: 400 }))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ response_id: 900 }]);

		await dispatch({ type: "answer", optionIds: [correctOptionId(1)] });

		expect(mock.updateTables).toContain(usersTable);
		expect(mock.setCalls.at(-1)).toHaveProperty("peak_storage_kb");
	});

	it("leaves the account's KB mark alone when the balance sets no record", async () => {
		mock.results.push([
			stateRow(answeringState({ storage: 100, peakStorageKb: 900 })),
		]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ response_id: 900 }]);

		await dispatch({ type: "answer", optionIds: [correctOptionId(1)] });

		expect(mock.updateTables).not.toContain(usersTable);
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
			mirrored: false,
		});
		expect(mock.insertTables).toContain(pollResponseOptionsTable);
		expect(mock.valuesCalls[1]).toEqual([
			{ response_id: 900, option_id: Number(correctOptionId(1)) },
		]);
	});

	it("records an answer given at a Mirror gate as mirrored", async () => {
		mock.results.push([
			stateRow(
				answeringState({ gatesCleared: 7, auditSchedule: { 7: ["mirrored"] } })
			),
		]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ response_id: 900 }]);

		await dispatch({ type: "answer", optionIds: [correctOptionId(1)] });

		expect(mock.valuesCalls[0]).toMatchObject({ mirrored: true });
	});

	it("drops unknown option ids instead of failing the dispatch", async () => {
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
		const state = answeringState({
			currentIndex: 1,
			window: {
				correct: 1,
				answered: 1,
				coverageGained: 0,
				byCategory: { js: { seen: 1, correct: 1 } },
			},
		});
		mock.results.push([stateRow(state)]);
		mock.results.push(segmentRow(TEST_DATES.christmasEve));
		mock.results.push([{ poll_id: 1 }]);
		mock.results.push(undefined);
		mock.results.push([{ poll_id: 1 }, { poll_id: 2 }, { poll_id: 3 }]);
		mock.results.push(undefined);
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
		const configuring = {
			...base,
			build: {
				...base.build,
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
		expect(db.update).toHaveBeenCalledTimes(2);
	});
});

describe("abandonSessionRun", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("finishes the run as abandoned without banking any storage", async () => {
		mock.results.push([
			{ state: toRunSnapshot(answeringState({ storage: 229 })) },
		]);
		mock.results.push([{ id: 64 }]);

		await abandonSessionRun(64, "red-from-pallet-town");

		expect(mock.setCalls[0]).toMatchObject({
			status: "finished",
			completion_reason: "abandoned",
		});
		expect(db.update).toHaveBeenCalledTimes(1);
	});

	it("throws when the run is already finished", async () => {
		mock.results.push([{ state: toRunSnapshot(answeringState({})) }]);
		mock.results.push([]);

		await expect(abandonSessionRun(64, "red-from-pallet-town")).rejects.toThrow(
			"Run is already over"
		);
	});

	it("abandons a corrupt run (no state row) with zero credit", async () => {
		mock.results.push([]);
		mock.results.push([{ id: 64 }]);

		await abandonSessionRun(64, "red-from-pallet-town");

		expect(mock.setCalls[0]).toMatchObject({ completion_reason: "abandoned" });
		expect(db.update).toHaveBeenCalledTimes(1);
	});
});

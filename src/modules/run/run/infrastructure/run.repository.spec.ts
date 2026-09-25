import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import {
	pollResponseOptionsTable,
	pollResponsesTable,
	runPollsTable,
	userConfigUnlocksTable,
	userObjectiveProgressTable,
	userServiceUnlocksTable,
	usersTable,
	userTitlesTable,
} from "~/database/schema";
import { KANTO_QUIZ, TEST_DATES } from "~/test/kanto";

import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { toRunSnapshot } from "~/modules/run/run/domain/runSnapshot.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	SLICE_WINDOW,
	VICTORY_GATE,
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

		const result = await dispatch({ type: "draft", configId: "agents-md" });

		expect(result.state.status).toBe("answering");
		expect(result.unlockedConfigIds).toEqual([]);
		expect(db.update).not.toHaveBeenCalled();
	});

	// DVTD-mkhg: `rebase` writes only `RunState.polls`, the one field the
	// snapshot drops, so without a write to `run_polls` the reorder was served
	// back in its original order on the very next dispatch.
	it("writes a rebased gate slice back to the run's poll sequence", async () => {
		const base = createRun([], [CONFIGS.gitRebase]);
		const prepping: RunState = {
			...base,
			status: "configuring",
			build: { ...base.build, configs: [CONFIGS.gitRebase] },
		};
		const ids = [1, 2, 3, 4, 5];
		mock.results.push([stateRow(prepping)]);
		mock.results.push(segmentRow());
		mock.results.push(ids.map(dbPoll));
		mock.results.push(ids.flatMap(dbOptions));

		await dispatch({ type: "rebase", from: 0, to: 2 });

		expect(mock.updateTables).toContain(runPollsTable);
		expect(mock.setCalls.slice(0, SLICE_WINDOW)).toEqual(
			[2, 3, 1, 4, 5].map((poll_id) => ({ poll_id }))
		);
	});

	it("leaves the poll sequence alone for every action that is not a rebase", async () => {
		mock.results.push([stateRow(answeringState({ storage: 100 }))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ response_id: 900 }]);

		await dispatch({ type: "answer", optionIds: [correctOptionId(1)] });

		expect(mock.updateTables).not.toContain(runPollsTable);
	});

	it("persists what the settlement hands back, not the bare reducer output", async () => {
		mock.results.unshift([{ poll_id: 1 }]);
		mock.results.push([stateRow(answeringState({ storage: 100 }))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ response_id: 900 }]);
		const settle = vi.fn(
			async (_tx: unknown, _before: RunState, after: RunState) => ({
				...after,
				log: [...after.log, "settled"],
			})
		);

		const { state } = await applyActionToRun({
			runId: 64,
			userId: "red-from-pallet-town",
			today: TEST_DATES.birthday,
			action: { type: "answer", optionIds: [correctOptionId(1)] },
			settle,
		});

		expect(settle).toHaveBeenCalledWith(
			db,
			expect.objectContaining({ storage: 100 }),
			expect.objectContaining({ currentIndex: 1 })
		);
		expect(state.log).toContain("settled");
		const persisted = mock.setCalls.find((call) => "engine_status" in call);
		expect(persisted?.state).toMatchObject({
			log: expect.arrayContaining(["settled"]),
		});
	});

	it("persists the reducer output with denormalized columns", async () => {
		mock.results.push([stateRow(answeringState({ storage: 100 }))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ response_id: 900 }]);

		const { state: next } = await dispatch({
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
			build: { id: "build", configs: [CONFIGS.js] },
			gatesCleared: VICTORY_GATE,
			bankedUnits: SLICE_WINDOW * VICTORY_GATE,
			window: {
				correct: SLICE_WINDOW,
				answered: SLICE_WINDOW,
				unitsEarned: SLICE_WINDOW,
				byCategory: { js: { seen: SLICE_WINDOW, correct: SLICE_WINDOW } },
			},
		});
		mock.results.push([stateRow(summitReady)]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		// The title ledger read the run's end fires (ADR-109).
		mock.results.push([]);

		const { state: next } = await dispatch({ type: "close-gate" });

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

	// The title ledger is read once, when the run ends (ADR-109). Between the
	// objective upsert and that read sit the swatch stamp and the run_states
	// write, neither of which looks at what it gets back.
	const summitDispatchWith = (counts: readonly unknown[]) => {
		const summitReady = answeringState({
			storage: 100,
			coverage: 400,
			build: { id: "build", configs: [CONFIGS.js] },
			gatesCleared: VICTORY_GATE,
			bankedUnits: SLICE_WINDOW * VICTORY_GATE,
			window: {
				correct: SLICE_WINDOW,
				answered: SLICE_WINDOW,
				unitsEarned: SLICE_WINDOW,
				byCategory: { js: { seen: SLICE_WINDOW, correct: SLICE_WINDOW } },
			},
		});
		mock.results.push([stateRow(summitReady)]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([]);
		mock.results.push([]);
		mock.results.push(counts);
		return dispatch({ type: "close-gate" });
	};

	const titleRowsWritten = () =>
		mock.valuesCalls.find(
			(payload): payload is { title_id: string; exclusive: boolean }[] =>
				Array.isArray(payload) &&
				payload.some(
					(row) => row && typeof row === "object" && "title_id" in row
				)
		) ?? [];

	it("writes the titles the ledger satisfies when the run ends", async () => {
		await summitDispatchWith([{ metric: "runs-won", count: 1 }]);

		expect(mock.insertTables).toContain(userTitlesTable);
		expect(titleRowsWritten().map((row) => row.title_id)).toContain(
			"title-summit"
		);
	});

	it("writes a maintainer earned mid-run when the run it was crossed in ends", async () => {
		await summitDispatchWith([{ metric: "category-correct:git", count: 25 }]);

		expect(titleRowsWritten().map((row) => row.title_id)).toContain(
			"title-maintainer-git"
		);
	});

	it("flags a race title exclusive, which is the column the unique index keys on", async () => {
		await summitDispatchWith([{ metric: "runs-won", count: 1 }]);

		const rows = titleRowsWritten();

		expect(rows).toContainEqual(
			expect.objectContaining({
				title_id: "title-first-ascent",
				exclusive: true,
			})
		);
		expect(rows).toContainEqual(
			expect.objectContaining({ title_id: "title-summit", exclusive: false })
		);
	});

	it("writes no title row when the ledger satisfies none", async () => {
		await summitDispatchWith([]);

		expect(mock.insertTables).not.toContain(userTitlesTable);
	});

	it("leaves the title ledger alone while the run is still going", async () => {
		mock.results.push([stateRow(answeringState({ storage: 100 }))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ response_id: 900 }]);

		await dispatch({
			type: "answer",
			optionIds: [correctOptionId(1)],
			elapsedMs: 1_200,
		});

		expect(mock.insertTables).not.toContain(userTitlesTable);
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

	it("earns the swatch of a flawless window, written before the state row", async () => {
		const closing = answeringState({
			coverage: 10,
			build: { id: "build", configs: [CONFIGS.js] },
			window: {
				correct: SLICE_WINDOW,
				answered: SLICE_WINDOW,
				unitsEarned: SLICE_WINDOW,
				byCategory: { js: { seen: SLICE_WINDOW, correct: SLICE_WINDOW } },
			},
		});
		mock.results.push([stateRow(closing)]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		mock.results.push([{ metric: "polls-answered", count: 1 }]);

		const { state: next } = await dispatch({ type: "close-gate" });

		expect(next.gatesCleared).toBe(1);
		expect(mock.updateTables[0]).toBe(usersTable);
		expect(mock.setCalls[0]).toHaveProperty("owned_swatch_ids");
	});

	it("earns no swatch when the action shuts no window", async () => {
		mock.results.push([stateRow(answeringState({}))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ response_id: 900 }]);

		await dispatch({ type: "answer", optionIds: [correctOptionId(1)] });

		expect(mock.updateTables).not.toContain(usersTable);
	});

	it("earns no swatch for a clear that carried a miss (ADR-080)", async () => {
		const closing = answeringState({
			coverage: 10,
			build: { id: "build", configs: [CONFIGS.js] },
			window: {
				correct: SLICE_WINDOW - 1,
				answered: SLICE_WINDOW,
				unitsEarned: SLICE_WINDOW - 1,
				byCategory: {
					js: { seen: SLICE_WINDOW, correct: SLICE_WINDOW - 1 },
				},
			},
		});
		mock.results.push([stateRow(closing)]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		mock.results.push([{ metric: "polls-answered", count: 1 }]);

		const { state: next } = await dispatch({ type: "close-gate" });

		expect(next.gatesCleared).toBe(1);
		expect(mock.setCalls.some((call) => "owned_swatch_ids" in call)).toBe(
			false
		);
	});

	it("keeps the run active when the day's polls run out mid-window (ADR-014)", async () => {
		mock.results.push([stateRow(answeringState({ storage: 100 }))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ response_id: 900 }]);

		const { state: next } = await dispatch({
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
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
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
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ response_id: 900 }]);

		await dispatch({ type: "answer", optionIds: [correctOptionId(1)] });

		expect(mock.updateTables).not.toContain(usersTable);
	});

	it("writes the answer as a session polls_responses row with its picked options", async () => {
		mock.results.push([stateRow(answeringState({}))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ response_id: 900 }]);

		await dispatch({ type: "answer", optionIds: [correctOptionId(1)] });

		expect(mock.insertTables).toContain(pollResponsesTable);
		expect(mock.valuesCalls[1]).toMatchObject({
			poll_id: 1,
			user_id: "red-from-pallet-town",
			run_id: 64,
			mode: "session",
			answer_date: TEST_DATES.birthday,
			mirrored: false,
		});
		expect(mock.insertTables).toContain(pollResponseOptionsTable);
		expect(mock.valuesCalls[2]).toEqual([
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
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ response_id: 900 }]);

		await dispatch({ type: "answer", optionIds: [correctOptionId(1)] });

		expect(mock.valuesCalls[1]).toMatchObject({ mirrored: true });
	});

	it("drops unknown option ids instead of failing the dispatch", async () => {
		mock.results.push([stateRow(answeringState({}))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ response_id: 900 }]);

		const { state: next } = await dispatch({
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
				unitsEarned: 0,
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
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ response_id: 900 }]);

		const { state: next } = await dispatch({
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
		expect(mock.valuesCalls[2]).toMatchObject({
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

		const { state: next } = await dispatch({ type: "start" });

		expect(next.status).toBe("answering");
		expect(mock.insertTables).not.toContain(pollResponsesTable);
		expect(mock.insertTables).not.toContain(userObjectiveProgressTable);
		expect(db.update).toHaveBeenCalled();
	});

	it("queues an answer's touched metrics in one batched upsert", async () => {
		mock.results.push([stateRow(answeringState({}))]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1), dbPoll(2)]);
		mock.results.push([...dbOptions(1), ...dbOptions(2)]);
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ response_id: 900 }]);

		await dispatch({ type: "answer", optionIds: [correctOptionId(1)] });

		expect(mock.insertTables).toContain(userObjectiveProgressTable);
		expect(mock.valuesCalls[0]).toEqual([
			{ user_id: "red-from-pallet-town", metric: "polls-answered", count: 1 },
			{ user_id: "red-from-pallet-town", metric: "polls-correct", count: 1 },
			{
				user_id: "red-from-pallet-town",
				metric: "category-correct:js",
				count: 1,
			},
		]);
	});

	const peekReady = () =>
		answeringState({
			storage: 100,
			build: {
				id: "build",
				configs: [CONFIGS.telemetry, CONFIGS.js],
			},
		});

	it("grants the config whose target the transaction crossed, with its provenance", async () => {
		mock.results.push([stateRow(peekReady())]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		mock.results.push([{ metric: "community-peeks", count: 5 }]);
		mock.results.push([{ config_id: "telemetry" }]);

		const result = await dispatch({ type: "peek-poll" });

		expect(mock.insertTables).toContain(userConfigUnlocksTable);
		expect(mock.valuesCalls[1]).toEqual([
			{
				user_id: "red-from-pallet-town",
				config_id: "telemetry",
				via_metric: "community-peeks",
			},
		]);
		expect(result.unlockedConfigIds).toEqual(["telemetry"]);
	});

	it("grants the service whose gate the transaction reached, off the same counts", async () => {
		mock.results.push([stateRow(peekReady())]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		mock.results.push([{ metric: "reached-gate:2", count: 1 }]);
		mock.results.push([]);

		await dispatch({ type: "peek-poll" });

		expect(mock.insertTables).toContain(userServiceUnlocksTable);
		expect(mock.insertTables).not.toContain(userConfigUnlocksTable);
		expect(mock.valuesCalls[1]).toEqual([
			{
				user_id: "red-from-pallet-town",
				service_id: "extend",
				via_metric: "reached-gate:2",
			},
		]);
	});

	it("returns no unlock when the grant row already existed", async () => {
		mock.results.push([stateRow(peekReady())]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		mock.results.push([{ metric: "community-peeks", count: 6 }]);
		mock.results.push([]);

		const result = await dispatch({ type: "peek-poll" });

		expect(result.unlockedConfigIds).toEqual([]);
	});

	it("writes no unlock row while every touched count sits below its targets", async () => {
		mock.results.push([stateRow(peekReady())]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		mock.results.push([{ metric: "community-peeks", count: 2 }]);

		const result = await dispatch({ type: "peek-poll" });

		expect(mock.insertTables).toContain(userObjectiveProgressTable);
		expect(mock.insertTables).not.toContain(userConfigUnlocksTable);
		expect(result.unlockedConfigIds).toEqual([]);
	});

	it("marks a bare-build gate failure as dead without crediting empty storage", async () => {
		const bare = {
			...createRun([], []),
			status: "answering" as const,
			currentIndex: 4,
			window: {
				correct: 0,
				answered: SLICE_WINDOW,
				unitsEarned: 0,
				byCategory: { js: { seen: SLICE_WINDOW, correct: 0 } },
			},
		};
		mock.results.push([stateRow(bare)]);
		mock.results.push(segmentRow());
		mock.results.push([1, 2, 3, 4, 5].map(dbPoll));
		mock.results.push([1, 2, 3, 4, 5].flatMap(dbOptions));
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		// The title ledger read the run's end fires (ADR-109).
		mock.results.push([]);

		const { state: next } = await dispatch({ type: "close-gate" });

		expect(next.status).toBe("dead");
		expect(mock.setCalls[1]).toMatchObject({
			status: "finished",
			completion_reason: "dead",
		});
		expect(db.update).toHaveBeenCalledTimes(2);
	});
});

describe("first install stamp (ADR-064)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	const configuringWith = (configs: RunState["build"]["configs"]): RunState => {
		const base = createRun([], [CONFIGS.js, CONFIGS.gitRebase]);
		return {
			...base,
			status: "configuring",
			build: { ...base.build, configs },
		};
	};

	const dispatchOn = (
		state: RunState,
		action: Parameters<typeof applyActionToRun>[0]["action"]
	) => {
		mock.results.unshift([{ poll_id: 1 }]);
		mock.results.push([stateRow(state)]);
		mock.results.push(segmentRow());
		mock.results.push([dbPoll(1)]);
		mock.results.push(dbOptions(1));
		return applyActionToRun({
			runId: 64,
			userId: "red-from-pallet-town",
			today: TEST_DATES.birthday,
			action,
		});
	};

	it("stamps the config the action just put into the build", async () => {
		await dispatchOn(configuringWith([]), {
			type: "install",
			configId: CONFIGS.js.id,
		});

		expect(mock.updateTables).toContain(userConfigUnlocksTable);
		expect(mock.setCalls).toContainEqual(
			expect.objectContaining({ first_installed_at: expect.anything() })
		);
	});

	// The build is what gets read, not the action: a config also arrives by
	// buying it off the shop shelf, and that must stamp the same way.
	it("stamps nothing when the action leaves the build untouched", async () => {
		await dispatchOn(configuringWith([CONFIGS.js]), {
			type: "uninstall",
			configId: CONFIGS.js.id,
		});

		expect(mock.updateTables).not.toContain(userConfigUnlocksTable);
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

import { and, asc, eq, inArray, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	dailyRunPollsTable,
	dailyRunSeedsTable,
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	pollsTable,
	runStatesTable,
	runsTable,
	usersTable,
} from "~/database/schema";
import { type CategoryCode, isCategoryCode } from "~/domains/shared/categories";
import { STORAGE_UNITS } from "~/lib/storage";

import {
	type RunAction,
	type RunPoll,
	type RunState,
	runReducer,
} from "../climb/run.model";
import {
	hydrateRunState,
	type RunSnapshot,
	toRunSnapshot,
} from "../climb/runSnapshot.model";
import { rollDailySeedSequence } from "../services/seed.service";

export type SessionRunRecord = typeof runsTable.$inferSelect;

/** Both `db` and a transaction handle satisfy this — reads work inside either. */
type DbReader = Pick<typeof db, "select">;

const toCategory = (code: string): CategoryCode => {
	if (!isCategoryCode(code)) {
		throw new Error(`Poll has unknown category code: ${code}`);
	}
	return code;
};

const fetchSeedPollIds = async (
	reader: DbReader,
	date: string
): Promise<number[]> => {
	const rows = await reader
		.select({ poll_id: dailyRunPollsTable.poll_id })
		.from(dailyRunPollsTable)
		.where(eq(dailyRunPollsTable.date, date))
		.orderBy(asc(dailyRunPollsTable.position));
	return rows.map((row) => row.poll_id);
};

/**
 * The day's shared climb sequence (ADR-009), created exactly once. Losing a
 * creation race is fine: the insert blocks on the winner's in-flight unique
 * conflict, then falls through to reading the winner's committed sequence.
 */
export const getOrCreateDailyRunSeed = async (
	date: string
): Promise<number[]> => {
	const existing = await fetchSeedPollIds(db, date);
	if (existing.length > 0) return existing;

	return db.transaction(async (tx) => {
		const [claimed] = await tx
			.insert(dailyRunSeedsTable)
			.values({ date, seed: date })
			.onConflictDoNothing()
			.returning({ id: dailyRunSeedsTable.id });

		if (!claimed) return fetchSeedPollIds(tx, date);

		const published = await tx
			.select({ id: pollsTable.id })
			.from(pollsTable)
			.where(eq(pollsTable.status, "published"))
			.orderBy(asc(pollsTable.id));

		const sequence = rollDailySeedSequence(
			date,
			published.map((row) => row.id)
		);
		if (sequence.length === 0) {
			throw new Error("No published polls available to seed the daily run");
		}

		await tx
			.insert(dailyRunPollsTable)
			.values(
				sequence.map((poll_id, position) => ({ date, position, poll_id }))
			);
		return sequence;
	});
};

/**
 * Hydrates the day's sequence into engine polls — WITH correctness. The result
 * must never leave the server; clients only ever see toRunView output.
 */
const fetchRunPollsWith = async (
	reader: DbReader,
	date: string
): Promise<RunPoll[]> => {
	const pollRows = await reader
		.select({
			id: pollsTable.id,
			question: pollsTable.question,
			answerType: pollsTable.answer_type,
			categoryCode: pollsTable.category_code,
		})
		.from(dailyRunPollsTable)
		.innerJoin(pollsTable, eq(dailyRunPollsTable.poll_id, pollsTable.id))
		.where(eq(dailyRunPollsTable.date, date))
		.orderBy(asc(dailyRunPollsTable.position));

	if (pollRows.length === 0) return [];

	const optionRows = await reader
		.select({
			id: pollOptionsTable.id,
			poll_id: pollOptionsTable.poll_id,
			option: pollOptionsTable.option,
			correct: pollOptionsTable.correct,
		})
		.from(pollOptionsTable)
		.where(
			inArray(
				pollOptionsTable.poll_id,
				pollRows.map((row) => row.id)
			)
		);

	return pollRows.map((poll) => ({
		id: String(poll.id),
		category: toCategory(poll.categoryCode),
		question: poll.question,
		answerType: poll.answerType,
		options: optionRows
			.filter((option) => option.poll_id === poll.id)
			.map((option) => ({
				id: String(option.id),
				label: option.option,
				correct: option.correct,
			})),
	}));
};

export const fetchRunPollsForDate = async (date: string): Promise<RunPoll[]> =>
	fetchRunPollsWith(db, date);

export const findSessionRunByDate = async (
	userId: string,
	seedDate: string
): Promise<SessionRunRecord | null> => {
	const [run] = await db
		.select()
		.from(runsTable)
		.where(
			and(
				eq(runsTable.user_id, userId),
				eq(runsTable.mode, "session"),
				eq(runsTable.seed_date, seedDate)
			)
		)
		.limit(1);
	return run ?? null;
};

export const fetchRunSnapshot = async (
	runId: number
): Promise<RunSnapshot | null> => {
	const [row] = await db
		.select({ state: runStatesTable.state })
		.from(runStatesTable)
		.where(eq(runStatesTable.run_id, runId))
		.limit(1);
	return row?.state ?? null;
};

export const createSessionRunWithState = async (
	userId: string,
	seedDate: string,
	initialState: RunState
): Promise<{ runId: number }> =>
	db.transaction(async (tx) => {
		const [run] = await tx
			.insert(runsTable)
			.values({
				user_id: userId,
				mode: "session",
				seed_date: seedDate,
				status: "active",
			})
			.returning({ id: runsTable.id });

		await tx.insert(runStatesTable).values({
			run_id: run.id,
			state: toRunSnapshot(initialState),
			engine_status: initialState.status,
			gates_cleared: initialState.gatesCleared,
			coverage: initialState.coverage,
			polls_answered: initialState.currentIndex,
		});

		return { runId: run.id };
	});

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Maps engine option ids (strings) back to DB option ids for the answered
 * poll. The engine tolerates unknown ids (they count as a wrong pick), so the
 * persistence layer must not be stricter than the game authority.
 */
const toSelectedOptionRecordIds = (
	poll: RunPoll,
	optionIds: readonly string[]
): number[] =>
	poll.options
		.filter((option) => optionIds.includes(option.id))
		.map((option) => Number(option.id));

/**
 * Session answers double as real polls_responses rows (slice 2, ADR-005) so
 * answer data is queryable by the social layer — even for abandoned runs.
 * Runs inside the dispatch transaction: the response row commits iff the
 * state advance commits. score_breakdown/coverage_delta stay null; session
 * scoring lives in run_states.
 */
const recordSessionAnswer = async (
	tx: Tx,
	args: { runId: number; userId: string; seedDate: string },
	poll: RunPoll,
	optionIds: readonly string[]
): Promise<void> => {
	const [response] = await tx
		.insert(pollResponsesTable)
		.values({
			poll_id: Number(poll.id),
			user_id: args.userId,
			run_id: args.runId,
			mode: "session",
			answer_date: args.seedDate,
		})
		.returning({ response_id: pollResponsesTable.response_id });

	if (!response) throw new Error("Failed to record session answer");

	const selectedIds = toSelectedOptionRecordIds(poll, optionIds);
	if (selectedIds.length === 0) return;

	await tx.insert(pollResponseOptionsTable).values(
		selectedIds.map((option_id) => ({
			response_id: response.response_id,
			option_id,
		}))
	);
};

const finishSessionRun = async (
	tx: Tx,
	runId: number,
	userId: string,
	state: RunState
): Promise<void> => {
	const wonAt =
		state.status === "won" ? { victory_achieved_at: new Date() } : {};
	await tx
		.update(runsTable)
		.set({
			status: "finished",
			finished_at: new Date(),
			completion_reason: state.status === "won" ? "victory" : "dead",
			...wonAt,
		})
		.where(eq(runsTable.id, runId));

	// Economy bridge (decided 2026-07-17): leftover run storage becomes
	// persistent meta-currency. Engine storage is KB; archived_storage is bytes.
	const leftoverBytes = Math.round(state.storage * STORAGE_UNITS.KB);
	if (leftoverBytes > 0) {
		await tx
			.update(usersTable)
			.set({
				archived_storage: sql`${usersTable.archived_storage} + ${leftoverBytes}`,
			})
			.where(eq(usersTable.id, userId));
	}
};

/**
 * The dispatch hot path. One transaction: lock the state row (serializes
 * double-submits), rehydrate, run the engine as authority, persist. Returns
 * the next state — identical to the previous state when the action was
 * illegal for the current status (the reducer's no-op contract).
 */
export const applyActionToRun = async (args: {
	runId: number;
	userId: string;
	seedDate: string;
	action: RunAction;
}): Promise<RunState> =>
	db.transaction(async (tx) => {
		const [stateRow] = await tx
			.select()
			.from(runStatesTable)
			.where(eq(runStatesTable.run_id, args.runId))
			.for("update");

		if (!stateRow) throw new Error("Run state not found");
		if (stateRow.engine_status === "won" || stateRow.engine_status === "dead") {
			throw new Error("Run is already over");
		}

		const polls = await fetchRunPollsWith(tx, args.seedDate);
		const state = hydrateRunState(stateRow.state, polls);
		const next = runReducer(state, args.action);
		if (next === state) return state;

		if (args.action.type === "answer") {
			// The answered poll comes from the PRE-action state — the reducer
			// has already advanced currentIndex past it in `next`.
			await recordSessionAnswer(
				tx,
				args,
				state.polls[state.currentIndex],
				args.action.optionIds
			);
		}

		await tx
			.update(runStatesTable)
			.set({
				state: toRunSnapshot(next),
				engine_status: next.status,
				gates_cleared: next.gatesCleared,
				coverage: next.coverage,
				polls_answered: next.currentIndex,
			})
			.where(eq(runStatesTable.run_id, args.runId));

		if (next.status === "won" || next.status === "dead") {
			await finishSessionRun(tx, args.runId, args.userId, next);
		}

		return next;
	});

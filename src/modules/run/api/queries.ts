import { and, asc, desc, eq, exists, gte, inArray, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	dailyRunPollsTable,
	dailyRunSeedsTable,
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	pollsTable,
	runPollsTable,
	runStatesTable,
	runsTable,
	usersTable,
} from "~/database/schema";
import { type CategoryCode, isCategoryCode } from "~/domains/shared/categories";
import { STORAGE_UNITS } from "~/lib/storage";

import { storageCreditRate } from "../rules.model";

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

		// Answerable published polls only: a poll without a single correct
		// option can never be answered right (engine stays strict — see
		// "answer judging" in run.model.spec), so it must not enter a climb.
		const published = await tx
			.select({ id: pollsTable.id })
			.from(pollsTable)
			.where(
				and(
					eq(pollsTable.status, "published"),
					exists(
						tx
							.select({ one: sql`1` })
							.from(pollOptionsTable)
							.where(
								and(
									eq(pollOptionsTable.poll_id, pollsTable.id),
									eq(pollOptionsTable.correct, true)
								)
							)
					)
				)
			)
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

const ENGINE_POLL_COLUMNS = {
	id: pollsTable.id,
	question: pollsTable.question,
	codeBlock: pollsTable.code_block,
	codeSandboxUrl: pollsTable.code_sandbox_example,
	answerType: pollsTable.answer_type,
	categoryCode: pollsTable.category_code,
	explanation: pollsTable.explanation,
};

type EnginePollRow = {
	id: number;
	question: string;
	codeBlock: string | null;
	codeSandboxUrl: string | null;
	answerType: RunPoll["answerType"];
	categoryCode: string;
	explanation: string | null;
};

/**
 * Hydrates poll rows into engine polls — WITH correctness. The result must
 * never leave the server; clients only ever see toRunView output.
 */
const withOptions = async (
	reader: DbReader,
	pollRows: EnginePollRow[]
): Promise<RunPoll[]> => {
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
		codeBlock: poll.codeBlock ?? undefined,
		codeSandboxUrl: poll.codeSandboxUrl ?? undefined,
		answerType: poll.answerType,
		explanation: poll.explanation ?? undefined,
		options: optionRows
			.filter((option) => option.poll_id === poll.id)
			.map((option) => ({
				id: String(option.id),
				label: option.option,
				correct: option.correct,
			})),
	}));
};

const fetchRunPollsWith = async (
	reader: DbReader,
	date: string
): Promise<RunPoll[]> => {
	const pollRows = await reader
		.select(ENGINE_POLL_COLUMNS)
		.from(dailyRunPollsTable)
		.innerJoin(pollsTable, eq(dailyRunPollsTable.poll_id, pollsTable.id))
		.where(eq(dailyRunPollsTable.date, date))
		.orderBy(asc(dailyRunPollsTable.position));
	return withOptions(reader, pollRows);
};

export const fetchRunPollsForDate = async (date: string): Promise<RunPoll[]> =>
	fetchRunPollsWith(db, date);

/**
 * The run's own materialized sequence (ADR-011) — the engine's poll list.
 * Ordered by position; may span multiple daily segments.
 */
export const fetchRunPollsForRun = async (
	runId: number,
	reader: DbReader = db
): Promise<RunPoll[]> => {
	const pollRows = await reader
		.select(ENGINE_POLL_COLUMNS)
		.from(runPollsTable)
		.innerJoin(pollsTable, eq(runPollsTable.poll_id, pollsTable.id))
		.where(eq(runPollsTable.run_id, runId))
		.orderBy(asc(runPollsTable.position));
	return withOptions(reader, pollRows);
};

/** The user's persistent run-in-progress (ADR-011) — at most one exists. */
export const findActiveSessionRun = async (
	userId: string
): Promise<SessionRunRecord | null> => {
	const [run] = await db
		.select()
		.from(runsTable)
		.where(
			and(
				eq(runsTable.user_id, userId),
				eq(runsTable.mode, "session"),
				eq(runsTable.status, "active")
			)
		)
		.orderBy(desc(runsTable.id))
		.limit(1);
	return run ?? null;
};

/** Latest run started on `seedDate` — several may exist since same-day restart (DVTD-li9i). */
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
		.orderBy(desc(runsTable.id))
		.limit(1);
	return run ?? null;
};

/**
 * Every poll the user answered today across ALL their runs. New runs start
 * from today's seed minus these, so a same-day restart can never re-answer a
 * poll — one vote per player per poll per day stays true for the community.
 */
export const fetchAnsweredPollIdsForDay = async (
	userId: string,
	date: string
): Promise<Set<number>> => {
	const rows = await db
		.select({ poll_id: pollResponsesTable.poll_id })
		.from(pollResponsesTable)
		.where(
			and(
				eq(pollResponsesTable.user_id, userId),
				eq(pollResponsesTable.mode, "session"),
				eq(pollResponsesTable.answer_date, date)
			)
		);
	return new Set(rows.map((row) => row.poll_id));
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

		await tx.insert(runPollsTable).values(
			initialState.polls.map((poll, position) => ({
				run_id: run.id,
				position,
				poll_id: Number(poll.id),
				segment_date: seedDate,
			}))
		);

		return { runId: run.id };
	});

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Day rollover (ADR-011 Decision 2). If the run's newest segment predates
 * `today`: drop the unplayed tail (positions >= currentIndex), then append
 * today's shared sequence minus polls already answered in this run. Same-day
 * calls are no-ops, so this is safe on every read and dispatch. Callers must
 * hold the run_states FOR UPDATE lock — it serializes concurrent rollovers.
 */
const ensureTodaysSegmentWith = async (
	tx: Tx,
	runId: number,
	today: string,
	currentIndex: number
): Promise<void> => {
	const [latest] = await tx
		.select({ segment_date: runPollsTable.segment_date })
		.from(runPollsTable)
		.where(eq(runPollsTable.run_id, runId))
		.orderBy(desc(runPollsTable.segment_date))
		.limit(1);
	if (!latest || latest.segment_date >= today) return;

	const answeredRows = await tx
		.select({ poll_id: pollResponsesTable.poll_id })
		.from(pollResponsesTable)
		.where(
			and(
				eq(pollResponsesTable.run_id, runId),
				eq(pollResponsesTable.mode, "session")
			)
		);
	const answered = new Set(answeredRows.map((row) => row.poll_id));

	await tx
		.delete(runPollsTable)
		.where(
			and(
				eq(runPollsTable.run_id, runId),
				gte(runPollsTable.position, currentIndex)
			)
		);

	const todaysSequence = await fetchSeedPollIds(tx, today);
	const fresh = todaysSequence.filter((pollId) => !answered.has(pollId));
	if (fresh.length === 0) return;

	await tx.insert(runPollsTable).values(
		fresh.map((poll_id, offset) => ({
			run_id: runId,
			position: currentIndex + offset,
			poll_id,
			segment_date: today,
		}))
	);
};

/** Standalone rollover for read paths (getTodaysRun). Dispatch rolls over inside its own transaction. */
export const ensureTodaysSegment = async (
	runId: number,
	today: string
): Promise<void> =>
	db.transaction(async (tx) => {
		const [stateRow] = await tx
			.select({ polls_answered: runStatesTable.polls_answered })
			.from(runStatesTable)
			.where(eq(runStatesTable.run_id, runId))
			.for("update");
		if (!stateRow) throw new Error("Run state not found");
		await ensureTodaysSegmentWith(tx, runId, today, stateRow.polls_answered);
	});

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
	args: { runId: number; userId: string; today: string },
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
			answer_date: args.today,
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
	const reason = state.status === "won" ? "victory" : "dead";
	const wonAt =
		state.status === "won" ? { victory_achieved_at: new Date() } : {};
	await tx
		.update(runsTable)
		.set({
			status: "finished",
			finished_at: new Date(),
			completion_reason: reason,
			...wonAt,
		})
		.where(eq(runsTable.id, runId));

	// Economy bridge: leftover run storage becomes persistent meta-currency,
	// at a rate proportional to how far the climb got (storageCreditRate).
	// Engine storage is KB; archived_storage is bytes.
	const creditBytes = Math.round(
		state.storage *
			STORAGE_UNITS.KB *
			storageCreditRate(reason, state.gatesCleared)
	);
	if (creditBytes > 0) {
		await tx
			.update(usersTable)
			.set({
				archived_storage: sql`${usersTable.archived_storage} + ${creditBytes}`,
			})
			.where(eq(usersTable.id, userId));
	}
};

/**
 * Walking away: the run finishes as "abandoned" and its leftover storage is
 * banked at STORAGE_CREDIT_RATE.abandoned (currently nothing — abandoning is
 * not a cash-out). Locks the state row like dispatch does, so an in-flight
 * answer and an abandon cannot interleave.
 */
export const abandonSessionRun = async (
	runId: number,
	userId: string
): Promise<void> =>
	db.transaction(async (tx) => {
		// A missing state row means a corrupt, unplayable run (seen once on
		// dev) — abandoning is exactly how it gets cleaned up, with 0 credit.
		const [stateRow] = await tx
			.select({ state: runStatesTable.state })
			.from(runStatesTable)
			.where(eq(runStatesTable.run_id, runId))
			.for("update");

		const updated = await tx
			.update(runsTable)
			.set({
				status: "finished",
				finished_at: new Date(),
				completion_reason: "abandoned",
			})
			.where(and(eq(runsTable.id, runId), eq(runsTable.status, "active")))
			.returning({ id: runsTable.id });
		if (updated.length === 0) throw new Error("Run is already over");

		const creditBytes = Math.round(
			(stateRow?.state.storage ?? 0) *
				STORAGE_UNITS.KB *
				storageCreditRate("abandoned", stateRow?.state.gatesCleared ?? 0)
		);
		if (creditBytes > 0) {
			await tx
				.update(usersTable)
				.set({
					archived_storage: sql`${usersTable.archived_storage} + ${creditBytes}`,
				})
				.where(eq(usersTable.id, userId));
		}
	});

/**
 * The dispatch hot path. One transaction: lock the state row (serializes
 * double-submits), rehydrate, run the engine as authority, persist. Returns
 * the next state — identical to the previous state when the action was
 * illegal for the current status (the reducer's no-op contract).
 */
export const applyActionToRun = async (args: {
	runId: number;
	userId: string;
	today: string;
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

		await ensureTodaysSegmentWith(
			tx,
			args.runId,
			args.today,
			stateRow.polls_answered
		);
		const polls = await fetchRunPollsForRun(args.runId, tx);
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

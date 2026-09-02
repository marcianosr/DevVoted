import { and, asc, desc, eq, exists, gte, inArray, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	dailyRunPollsTable,
	dailyRunSeedsTable,
	pollOptionsTable,
	pollResponsesTable,
	pollsTable,
	runPollsTable,
	usersTable,
} from "~/database/schema";
import { type CategoryCode, isCategoryCode } from "~/shared/lib/categories";

import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import { rollDailySeedSequence } from "~/modules/run/run/domain/seed.model";

/**
 * Every statement against the poll-sequence tables: the day's shared sequence
 * (`daily_run_seeds`, `daily_run_polls`) and each run's materialized copy of it
 * (`run_polls`). Split out of `run.repository` (DVTD-eyya), which keeps the run
 * record, its state and the dispatch transaction.
 *
 * The cut is by table knowledge rather than by read-versus-write, because the
 * rollover is both: it reads today's seed and writes the run's tail. Anything
 * that must join the caller's transaction takes a `reader`/`tx`, so the dispatch
 * hot path still commits everything in one transaction of its own.
 */

/** Both `db` and a transaction handle satisfy this — reads work inside either. */
export type DbReader = Pick<typeof db, "select">;
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const toCategory = (code: string): CategoryCode => {
	if (!isCategoryCode(code)) {
		throw new Error(`Poll has unknown category code: ${code}`);
	}
	return code;
};

export const fetchSeedPollIds = async (
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
	author: usersTable.github_username,
};

type EnginePollRow = {
	id: number;
	question: string;
	codeBlock: string | null;
	codeSandboxUrl: string | null;
	answerType: RunPoll["answerType"];
	categoryCode: string;
	explanation: string | null;
	author: string | null;
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
		author: poll.author === null ? undefined : `@${poll.author}`,
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
		.leftJoin(usersTable, eq(pollsTable.created_by, usersTable.id))
		.where(eq(dailyRunPollsTable.date, date))
		.orderBy(asc(dailyRunPollsTable.position));
	return withOptions(reader, pollRows);
};

/**
 * The day's shared sequence, materializing it first if this is the first
 * request of the day. Seeding here rather than at the call site is the same
 * rule `ensureTodaysSegment` and `applyActionToRun` follow: every reader of
 * today's sequence guarantees it exists, because a missing one reads as an
 * empty day rather than an error.
 */
export const fetchRunPollsForDate = async (
	date: string
): Promise<RunPoll[]> => {
	await getOrCreateDailyRunSeed(date);
	return fetchRunPollsWith(db, date);
};

/**
 * The categories of a date's shared sequence, materializing the seed first —
 * Prefetch's product (DVTD-ekbz). Called with tomorrow's date this IS the
 * early roll: the set freezes now, so polls published later today cannot
 * enter it. Categories only — the questions stay sealed until the day deals
 * them, and correctness never touches this path.
 */
export const fetchSeedCategoriesForDate = async (
	date: string
): Promise<CategoryCode[]> => {
	await getOrCreateDailyRunSeed(date);
	const rows = await db
		.select({ categoryCode: pollsTable.category_code })
		.from(dailyRunPollsTable)
		.innerJoin(pollsTable, eq(dailyRunPollsTable.poll_id, pollsTable.id))
		.where(eq(dailyRunPollsTable.date, date))
		.orderBy(asc(dailyRunPollsTable.position));
	return rows.map((row) => toCategory(row.categoryCode));
};

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
		.leftJoin(usersTable, eq(pollsTable.created_by, usersTable.id))
		.where(eq(runPollsTable.run_id, runId))
		.orderBy(asc(runPollsTable.position));
	return withOptions(reader, pollRows);
};

/** A new run's opening segment, copied from the day it started on. */
export const insertRunPolls = async (
	tx: Pick<typeof db, "insert">,
	runId: number,
	polls: readonly RunPoll[],
	segmentDate: string
): Promise<void> => {
	await tx.insert(runPollsTable).values(
		polls.map((poll, position) => ({
			run_id: runId,
			position,
			poll_id: Number(poll.id),
			segment_date: segmentDate,
		}))
	);
};

/**
 * Day rollover (ADR-011 Decision 2). If the run's newest segment predates
 * `today`: drop the unplayed tail (positions >= currentIndex), then append
 * today's shared sequence minus polls already answered in this run. Same-day
 * calls are no-ops, so this is safe on every read and dispatch. Callers must
 * hold the run_states FOR UPDATE lock — it serializes concurrent rollovers,
 * and taking it is `run.repository`'s job because run_states is its table.
 */
export const rollSegmentForward = async (
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

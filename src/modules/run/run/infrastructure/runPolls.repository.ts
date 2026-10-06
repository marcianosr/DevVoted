import { and, asc, desc, eq, exists, gte, inArray, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	dailyRunPollsTable,
	dailyRunSeedsTable,
	pollOptionsTable,
	pollResponsesTable,
	pollsTable,
	runPollsTable,
	runsTable,
	usersTable,
} from "~/database/schema";
import { type CategoryCode, isCategoryCode } from "~/shared/lib/categories";

import {
	type AuthorRole,
	roleLabelFor,
} from "~/modules/account/profile/domain/authorship.model";
import { borderUrlOf } from "~/modules/account/profile/domain/border.model";
import { primaryTitleName } from "~/modules/account/profile/domain/title.model";
import type {
	PollAuthor,
	RunPoll,
} from "~/modules/run/run/domain/runPoll.model";
import {
	dealDay,
	isDayShortOfFreshPolls,
	rollDailyReserve,
	rollDailySeedSequence,
} from "~/modules/run/run/domain/seed.model";

export type DbReader = Pick<typeof db, "select">;
type RunPollsWriter = Pick<typeof db, "select" | "delete" | "insert">;

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

const fetchDealablePollIds = async (reader: DbReader): Promise<number[]> => {
	const rows = await reader
		.select({ id: pollsTable.id })
		.from(pollsTable)
		.where(
			and(
				eq(pollsTable.status, "published"),
				exists(
					reader
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
	return rows.map((row) => row.id);
};

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

		const published = await fetchDealablePollIds(tx);

		const sequence = rollDailySeedSequence(date, published);
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
	groupLabels: pollsTable.group_labels,
	categoryCode: pollsTable.category_code,
	explanation: pollsTable.explanation,
	authorId: usersTable.id,
	authorName: usersTable.display_name,
	authorHandle: usersTable.github_username,
	authorPhotoUrl: usersTable.photo_url,
	authorBorderId: usersTable.equipped_border_id,
	authorRole: usersTable.role,
	authorTitleIds: usersTable.equipped_title_ids,
};

type EnginePollRow = {
	id: number;
	question: string;
	codeBlock: string | null;
	codeSandboxUrl: string | null;
	answerType: RunPoll["answerType"];
	groupLabels: string[] | null;
	categoryCode: string;
	explanation: string | null;
	authorId: string | null;
	authorName: string | null;
	authorHandle: string | null;
	authorPhotoUrl: string | null;
	authorBorderId: string | null;
	authorRole: AuthorRole | null;
	authorTitleIds: readonly string[] | null;
};

const authorOf = (row: EnginePollRow): PollAuthor | undefined => {
	if (row.authorName === null) return undefined;

	const borderUrl = borderUrlOf(row.authorBorderId);
	const role = roleLabelFor(row.authorRole);
	const title = primaryTitleName(row.authorTitleIds ?? []);

	return {
		name: row.authorName,
		...(row.authorHandle === null ? {} : { handle: `@${row.authorHandle}` }),
		...(row.authorId === null ? {} : { userId: row.authorId }),
		...(row.authorPhotoUrl === null ? {} : { avatarUrl: row.authorPhotoUrl }),
		...(borderUrl === null ? {} : { borderUrl }),
		...(role === undefined ? {} : { role }),
		...(title === null ? {} : { title }),
	};
};

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
			groupIndex: pollOptionsTable.group_index,
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
		...(poll.groupLabels === null ? {} : { groupLabels: poll.groupLabels }),
		explanation: poll.explanation ?? undefined,
		author: authorOf(poll),
		options: optionRows
			.filter((option) => option.poll_id === poll.id)
			.map((option) => ({
				id: String(option.id),
				label: option.option,
				correct: option.correct,
				...(option.groupIndex === null ? {} : { group: option.groupIndex }),
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

export const fetchRunPollsForDate = async (
	date: string
): Promise<RunPoll[]> => {
	await getOrCreateDailyRunSeed(date);
	return fetchRunPollsWith(db, date);
};

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

const fetchMissedPollIds = async (
	runId: number,
	pollIds: readonly number[],
	reader: DbReader
): Promise<ReadonlySet<string>> => {
	if (pollIds.length === 0) return new Set();

	const rows = await reader
		.select({ pollId: pollResponsesTable.poll_id })
		.from(pollResponsesTable)
		.where(
			and(
				eq(
					pollResponsesTable.user_id,
					sql`(SELECT ${runsTable.user_id} FROM ${runsTable} WHERE ${runsTable.id} = ${runId})`
				),
				inArray(pollResponsesTable.poll_id, pollIds),
				sql`${pollResponsesTable.outcome} is distinct from 'correct'`
			)
		);

	return new Set(rows.map((row) => String(row.pollId)));
};

export const fetchRunPollsForRun = async (
	runId: number,
	reader: DbReader = db,
	withMissedHistory = false
): Promise<RunPoll[]> => {
	const pollRows = await reader
		.select(ENGINE_POLL_COLUMNS)
		.from(runPollsTable)
		.innerJoin(pollsTable, eq(runPollsTable.poll_id, pollsTable.id))
		.leftJoin(usersTable, eq(pollsTable.created_by, usersTable.id))
		.where(eq(runPollsTable.run_id, runId))
		.orderBy(asc(runPollsTable.position));

	const polls = await withOptions(reader, pollRows);
	if (!withMissedHistory) return polls;

	const missed = await fetchMissedPollIds(
		runId,
		pollRows.map((row) => row.id),
		reader
	);

	return polls.map((poll) =>
		missed.has(poll.id) ? { ...poll, missedBefore: true } : poll
	);
};

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

export const fetchRunPollPositions = async (
	reader: DbReader,
	runId: number
): Promise<number[]> => {
	const rows = await reader
		.select({ position: runPollsTable.position })
		.from(runPollsTable)
		.where(eq(runPollsTable.run_id, runId))
		.orderBy(asc(runPollsTable.position));
	return rows.map((row) => row.position);
};

export const rewriteRunPollOrder = async (
	tx: Pick<typeof db, "select" | "update">,
	runId: number,
	startIndex: number,
	polls: readonly RunPoll[]
): Promise<void> => {
	const positions = await fetchRunPollPositions(tx, runId);
	for (const [offset, poll] of polls.entries()) {
		const position = positions[startIndex + offset];
		if (position === undefined) return;
		await tx
			.update(runPollsTable)
			.set({ poll_id: Number(poll.id) })
			.where(
				and(
					eq(runPollsTable.run_id, runId),
					eq(runPollsTable.position, position)
				)
			);
	}
};

export const rollSegmentForward = async (
	tx: RunPollsWriter,
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

	const positions = await fetchRunPollPositions(tx, runId);
	const firstDropped = positions[currentIndex];
	if (firstDropped !== undefined)
		await tx
			.delete(runPollsTable)
			.where(
				and(
					eq(runPollsTable.run_id, runId),
					gte(runPollsTable.position, firstDropped)
				)
			);
	const nextPosition = (positions[currentIndex - 1] ?? -1) + 1;

	const seed = await fetchSeedPollIds(tx, today);
	const reserve = isDayShortOfFreshPolls(seed, answered)
		? rollDailyReserve(today, await fetchDealablePollIds(tx))
		: [];
	const fresh = dealDay(seed, reserve, answered);
	if (fresh.length === 0) return;

	await tx.insert(runPollsTable).values(
		fresh.map((poll_id, offset) => ({
			run_id: runId,
			position: nextPosition + offset,
			poll_id,
			segment_date: today,
		}))
	);
};

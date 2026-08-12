import { and, asc, eq, inArray, lt } from "drizzle-orm";

import { db } from "~/database/db";
import {
	dailyRunSeedsTable,
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	pollsTable,
	runPollsTable,
	runStatesTable,
	usersTable,
} from "~/database/schema";

export type ConsumedRunPoll = {
	position: number;
	poll_id: number;
};

export const fetchRunProgress = async (runId: number): Promise<number> => {
	const [row] = await db
		.select({ polls_answered: runStatesTable.polls_answered })
		.from(runStatesTable)
		.where(eq(runStatesTable.run_id, runId))
		.limit(1);
	if (!row) throw new Error("Run state not found");
	return row.polls_answered;
};

/**
 * The viewer's polls from today's segment that they are already PAST
 * (answered or linted). Polls at or beyond currentIndex stay invisible to the
 * community page — their community data would spoil the climb ahead.
 */
export const fetchConsumedPollsForDay = async (
	runId: number,
	date: string,
	currentIndex: number
): Promise<ConsumedRunPoll[]> =>
	db
		.select({
			position: runPollsTable.position,
			poll_id: runPollsTable.poll_id,
		})
		.from(runPollsTable)
		.where(
			and(
				eq(runPollsTable.run_id, runId),
				eq(runPollsTable.segment_date, date),
				lt(runPollsTable.position, currentIndex)
			)
		)
		.orderBy(asc(runPollsTable.position));

export type CommunityPollRecord = {
	id: number;
	question: string;
	categoryCode: string;
	answerType: "single" | "multiple";
	options: { id: number; label: string; correct: boolean }[];
};

export const fetchPollsWithOptions = async (
	pollIds: number[]
): Promise<CommunityPollRecord[]> => {
	if (pollIds.length === 0) return [];

	const pollRows = await db
		.select({
			id: pollsTable.id,
			question: pollsTable.question,
			categoryCode: pollsTable.category_code,
			answerType: pollsTable.answer_type,
		})
		.from(pollsTable)
		.where(inArray(pollsTable.id, pollIds));

	const optionRows = await db
		.select({
			id: pollOptionsTable.id,
			poll_id: pollOptionsTable.poll_id,
			option: pollOptionsTable.option,
			correct: pollOptionsTable.correct,
		})
		.from(pollOptionsTable)
		.where(inArray(pollOptionsTable.poll_id, pollIds));

	return pollRows.map((poll) => ({
		id: poll.id,
		question: poll.question,
		categoryCode: poll.categoryCode,
		answerType: poll.answerType,
		options: optionRows
			.filter((option) => option.poll_id === poll.id)
			.map((option) => ({
				id: option.id,
				label: option.option,
				correct: option.correct,
			})),
	}));
};

export type SessionAnswerRow = {
	responseId: number;
	pollId: number;
	userId: string | null;
	displayName: string | null;
	photoUrl: string | null;
	optionId: number | null;
	categoryCode: string | null;
	answeredAt: Date | null;
	answerTimeMs: number | null;
};

/**
 * Every session answer given on `date`, across ALL of the day's polls — one
 * row per picked option. Feeds both the per-poll breakdowns and the
 * day-percentile ("top X%"), which needs everyone's full day, not just the
 * polls the viewer consumed.
 */
export const fetchSessionAnswersForDay = async (
	date: string
): Promise<SessionAnswerRow[]> =>
	db
		.select({
			responseId: pollResponsesTable.response_id,
			pollId: pollResponsesTable.poll_id,
			userId: pollResponsesTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			optionId: pollResponseOptionsTable.option_id,
			categoryCode: pollsTable.category_code,
			answeredAt: pollResponsesTable.created_at,
			answerTimeMs: pollResponsesTable.answer_time_ms,
		})
		.from(pollResponsesTable)
		.leftJoin(usersTable, eq(pollResponsesTable.user_id, usersTable.id))
		.leftJoin(pollsTable, eq(pollResponsesTable.poll_id, pollsTable.id))
		.leftJoin(
			pollResponseOptionsTable,
			eq(pollResponsesTable.response_id, pollResponseOptionsTable.response_id)
		)
		.where(
			and(
				eq(pollResponsesTable.mode, "session"),
				eq(pollResponsesTable.answer_date, date)
			)
		);

/** When today's seed dropped — the zero point for "first to answer". */
export const fetchDailySeedCreatedAt = async (
	date: string
): Promise<Date | null> => {
	const [row] = await db
		.select({ created_at: dailyRunSeedsTable.created_at })
		.from(dailyRunSeedsTable)
		.where(eq(dailyRunSeedsTable.date, date))
		.limit(1);
	return row?.created_at ?? null;
};

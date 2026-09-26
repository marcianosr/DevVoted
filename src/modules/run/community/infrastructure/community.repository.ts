import { and, asc, eq, inArray, lt, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	pollsTable,
	runPollsTable,
	runStatesTable,
	usersTable,
} from "~/database/schema";
import { borderUrlOf } from "~/modules/run/community/infrastructure/climbers.repository";

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
	borderUrl: string | null;
	optionId: number | null;
	mirrored: boolean;
};

export const fetchSessionAnswersForDay = async (
	date: string
): Promise<SessionAnswerRow[]> => {
	const rows = await db
		.select({
			responseId: pollResponsesTable.response_id,
			pollId: pollResponsesTable.poll_id,
			userId: pollResponsesTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			equippedBorderId: usersTable.equipped_border_id,
			optionId: pollResponseOptionsTable.option_id,
			mirrored: pollResponsesTable.mirrored,
		})
		.from(pollResponsesTable)
		.leftJoin(usersTable, eq(pollResponsesTable.user_id, usersTable.id))
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
	return rows.map(({ equippedBorderId, ...row }) => ({
		...row,
		borderUrl: borderUrlOf(equippedBorderId),
	}));
};

export type PollSplitRecord = {
	answeredCount: number;
	picksByOptionId: Readonly<Record<number, number>>;
};

export const fetchPollSplit = async (
	pollId: number
): Promise<PollSplitRecord> => {
	const honest = and(
		eq(pollResponsesTable.poll_id, pollId),
		eq(pollResponsesTable.mirrored, false)
	);

	const [totals] = await db
		.select({ answeredCount: sql<number>`count(*)::int` })
		.from(pollResponsesTable)
		.where(honest);

	const picks = await db
		.select({
			optionId: pollResponseOptionsTable.option_id,
			picks: sql<number>`count(*)::int`,
		})
		.from(pollResponseOptionsTable)
		.innerJoin(
			pollResponsesTable,
			eq(pollResponsesTable.response_id, pollResponseOptionsTable.response_id)
		)
		.where(honest)
		.groupBy(pollResponseOptionsTable.option_id);

	return {
		answeredCount: totals?.answeredCount ?? 0,
		picksByOptionId: Object.fromEntries(
			picks.map((row) => [row.optionId, row.picks])
		),
	};
};

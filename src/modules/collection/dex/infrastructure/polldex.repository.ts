import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	pollHistoryTable,
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	pollsTable,
} from "~/database/schema";

export type PolldexPollRow = {
	id: number;
	pollNumber: number | null;
	question: string;
	categoryCode: string;
};

export const fetchPublishedPollsForDex = async (): Promise<PolldexPollRow[]> =>
	db
		.select({
			id: pollsTable.id,
			pollNumber: pollsTable.poll_number,
			question: pollsTable.question,
			categoryCode: pollsTable.category_code,
		})
		.from(pollsTable)
		.where(eq(pollsTable.status, "published"))
		.orderBy(asc(pollsTable.id));

export type PolldexSeenRow = {
	pollId: number;
	timesSeen: number;
};

export const fetchSeenCountsByUser = async (
	userId: string
): Promise<PolldexSeenRow[]> =>
	db
		.select({
			pollId: pollHistoryTable.poll_id,
			timesSeen: sql<number>`SUM(${pollHistoryTable.times_seen})::int`,
		})
		.from(pollHistoryTable)
		.where(eq(pollHistoryTable.user_id, userId))
		.groupBy(pollHistoryTable.poll_id);

export type PolldexCorrectnessRow = {
	responseId: number;
	pollId: number;
	optionCorrect: boolean;
	optionSelected: number | null;
};

export const fetchAnswerCorrectnessByUser = async (
	userId: string
): Promise<PolldexCorrectnessRow[]> =>
	db
		.select({
			responseId: pollResponsesTable.response_id,
			pollId: pollResponsesTable.poll_id,
			optionCorrect: pollOptionsTable.correct,
			optionSelected: pollResponseOptionsTable.option_id,
		})
		.from(pollResponsesTable)
		.innerJoin(
			pollOptionsTable,
			eq(pollOptionsTable.poll_id, pollResponsesTable.poll_id)
		)
		.leftJoin(
			pollResponseOptionsTable,
			and(
				eq(
					pollResponseOptionsTable.response_id,
					pollResponsesTable.response_id
				),
				eq(pollResponseOptionsTable.option_id, pollOptionsTable.id)
			)
		)
		.where(eq(pollResponsesTable.user_id, userId));

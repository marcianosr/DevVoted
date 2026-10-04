import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "~/database/db";
import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";
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
	mirrored: boolean;
	answerType: AnswerType;
	optionId: number;
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
			mirrored: pollResponsesTable.mirrored,
			answerType: pollsTable.answer_type,
			optionId: pollOptionsTable.id,
			optionCorrect: pollOptionsTable.correct,
			optionSelected: pollResponseOptionsTable.option_id,
		})
		.from(pollResponsesTable)
		.innerJoin(pollsTable, eq(pollsTable.id, pollResponsesTable.poll_id))
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

export type PolldexCategoryRow = {
	id: number;
	categoryCode: string;
};

export const fetchPublishedPollCategories = async (): Promise<
	PolldexCategoryRow[]
> =>
	db
		.select({ id: pollsTable.id, categoryCode: pollsTable.category_code })
		.from(pollsTable)
		.where(eq(pollsTable.status, "published"));

export type PolldexAnsweredRow = {
	pollId: number;
	answeredCount: number;
};

export const fetchAnsweredCountsByUser = async (
	userId: string
): Promise<PolldexAnsweredRow[]> =>
	db
		.select({
			pollId: pollResponsesTable.poll_id,
			answeredCount: sql<number>`COUNT(${pollResponsesTable.response_id})::int`,
		})
		.from(pollResponsesTable)
		.where(eq(pollResponsesTable.user_id, userId))
		.groupBy(pollResponsesTable.poll_id);

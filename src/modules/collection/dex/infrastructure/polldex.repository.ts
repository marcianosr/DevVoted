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

/** Every published poll — the canon the Polldex catalogues. */
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

/**
 * Lifetime views per poll for one user — SUM(times_seen) across every run.
 * The batched form of `getTimesEncountered`, one row per encountered poll.
 */
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

/**
 * One row per (response, option) for all of the user's responses across both
 * modes. `optionSelected` is non-null when that option was chosen. Correctness
 * is deliberately NOT decided here — the handler folds these rows through
 * `evaluatePollAnswer` so the full/partial/wrong rule stays in one place.
 */
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

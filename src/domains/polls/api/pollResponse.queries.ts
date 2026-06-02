import { eq, and, gte, ne, sql, count, inArray } from "drizzle-orm";

import {
	pollHistoryTable,
	pollResponsesTable,
	pollResponseOptionsTable,
	pollOptionsTable,
	pollsTable,
} from "@/src/database/schema";
import { db } from "~/database/db";
import { pollResponseOptionFactory } from "~/domains/polls/models/pollResponseOption.model";
import {
	evaluatePollAnswer,
	type PollAnswerOutcome,
} from "~/domains/polls/services/pollAnswerEvaluation.service";
import type { ScoreCalculation } from "~/domains/runs/services/score.service";

type CreatePollResponse = {
	pollId: number;
	userId: string;
	runId: number;
	answerDate: string;
	selectedOptionIds: number[];
	coverageDelta: number;
	scoreBreakdown: ScoreCalculation;
};

export const createPollResponse = async ({
	pollId,
	userId,
	runId,
	answerDate,
	selectedOptionIds,
	coverageDelta,
	scoreBreakdown,
}: CreatePollResponse) => {
	await db.transaction(async (tx) => {
		const [pollResponseRecord] = await tx
			.insert(pollResponsesTable)
			.values({
				poll_id: pollId,
				user_id: userId,
				run_id: runId,
				answer_date: answerDate,
				coverage_delta: coverageDelta,
				score_breakdown: scoreBreakdown,
			})
			.returning();

		if (!pollResponseRecord) throw new Error("Failed to create poll response");

		if (selectedOptionIds.length > 0) {
			const responseOptionRecords = pollResponseOptionFactory.fromDTOs(
				selectedOptionIds.map((optionId) => ({
					responseId: pollResponseRecord.response_id,
					optionId,
				}))
			);
			await tx.insert(pollResponseOptionsTable).values(responseOptionRecords);
		}
	});
};

export const getPollResponseScoreBreakdown = async (
	pollId: number,
	userId: string,
	runId: number
): Promise<ScoreCalculation | null> => {
	const [response] = await db
		.select({ score_breakdown: pollResponsesTable.score_breakdown })
		.from(pollResponsesTable)
		.where(
			and(
				eq(pollResponsesTable.poll_id, pollId),
				eq(pollResponsesTable.user_id, userId),
				eq(pollResponsesTable.run_id, runId)
			)
		)
		.limit(1);

	return response?.score_breakdown ?? null;
};

export const hasUserAnsweredPoll = async (
	pollId: number,
	userId: string
): Promise<boolean> => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const existingResponse = await db
		.select()
		.from(pollResponsesTable)
		.where(
			and(
				eq(pollResponsesTable.poll_id, pollId),
				eq(pollResponsesTable.user_id, userId),
				gte(pollResponsesTable.created_at, today)
			)
		);

	return existingResponse.length > 0;
};

export const getUserSelectedOptions = async (
	pollId: number,
	userId: string
): Promise<string[]> => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const response = await db
		.select({ responseId: pollResponsesTable.response_id })
		.from(pollResponsesTable)
		.where(
			and(
				eq(pollResponsesTable.poll_id, pollId),
				eq(pollResponsesTable.user_id, userId),
				gte(pollResponsesTable.created_at, today)
			)
		)
		.limit(1);

	if (response.length === 0) return [];

	const selectedOptions = await db
		.select({ optionId: pollResponseOptionsTable.option_id })
		.from(pollResponseOptionsTable)
		.where(eq(pollResponseOptionsTable.response_id, response[0].responseId));

	return selectedOptions.map((option) => String(option.optionId));
};

export const getPollHistory = async (runId: number, pollId: number) => {
	const [record] = await db
		.select()
		.from(pollHistoryTable)
		.where(
			and(
				eq(pollHistoryTable.run_id, runId),
				eq(pollHistoryTable.poll_id, pollId)
			)
		);

	return record || null;
};

export const getLastSeenBeforeCurrentRun = async (
	userId: string,
	pollId: number,
	currentRunId: number
): Promise<Date | null> => {
	const [record] = await db
		.select({
			lastSeenAt: sql<Date | null>`MAX(${pollHistoryTable.last_seen_at})`,
		})
		.from(pollHistoryTable)
		.where(
			and(
				eq(pollHistoryTable.user_id, userId),
				eq(pollHistoryTable.poll_id, pollId),
				ne(pollHistoryTable.run_id, currentRunId)
			)
		);

	return record?.lastSeenAt ?? null;
};

export const trackPollView = async (
	runId: number,
	userId: string,
	pollId: number
): Promise<void> => {
	await db
		.insert(pollHistoryTable)
		.values({
			run_id: runId,
			user_id: userId,
			poll_id: pollId,
			times_seen: 1,
			times_answered: 0,
			first_seen_at: new Date(),
			last_seen_at: new Date(),
		})
		.onConflictDoUpdate({
			target: [pollHistoryTable.run_id, pollHistoryTable.poll_id],
			set: {
				times_seen: sql`${pollHistoryTable.times_seen} + 1`,
				last_seen_at: new Date(),
			},
		});
};

export const trackPollAnswer = async (
	runId: number,
	userId: string,
	pollId: number
): Promise<void> => {
	await db
		.insert(pollHistoryTable)
		.values({
			run_id: runId,
			user_id: userId,
			poll_id: pollId,
			times_seen: 1,
			times_answered: 1,
			first_seen_at: new Date(),
			last_seen_at: new Date(),
			last_answered_at: new Date(),
		})
		.onConflictDoUpdate({
			target: [pollHistoryTable.run_id, pollHistoryTable.poll_id],
			set: {
				times_answered: sql`${pollHistoryTable.times_answered} + 1`,
				last_answered_at: new Date(),
			},
		});
};

export const getPollsSeenInRun = async (runId: number): Promise<number> => {
	const result = await db
		.select({
			count: sql<number>`COUNT(DISTINCT ${pollHistoryTable.poll_id})::int`,
		})
		.from(pollHistoryTable)
		.where(eq(pollHistoryTable.run_id, runId));

	return result[0]?.count ?? 0;
};

export const getAnsweredPollsCountInRun = async (
	runId: number
): Promise<number> => {
	const result = await db
		.select({
			count: sql<number>`COUNT(DISTINCT ${pollResponsesTable.poll_id})::int`,
		})
		.from(pollResponsesTable)
		.where(eq(pollResponsesTable.run_id, runId));

	return result[0]?.count ?? 0;
};

export type RunPollHistory = {
	pollId: number;
	categoryCode: string;
	outcome: PollAnswerOutcome;
	answeredAt: Date | null;
};

export const getRunPollHistory = async (
	runId: number,
	userId: string
): Promise<RunPollHistory[]> => {
	const historyResults = await db
		.select({
			pollId: pollHistoryTable.poll_id,
			categoryCode: pollsTable.category_code,
			answeredAt: pollHistoryTable.last_answered_at,
			timesAnswered: pollHistoryTable.times_answered,
		})
		.from(pollHistoryTable)
		.innerJoin(pollsTable, eq(pollHistoryTable.poll_id, pollsTable.id))
		.where(
			and(
				eq(pollHistoryTable.run_id, runId),
				eq(pollHistoryTable.user_id, userId)
			)
		)
		.orderBy(sql`${pollHistoryTable.first_seen_at} ASC`);

	if (historyResults.length === 0) return [];

	const pollIds = historyResults.map((r) => r.pollId);

	const [correctnessResults, totalCorrectResults] = await Promise.all([
		db
			.select({
				pollId: pollResponsesTable.poll_id,
				selectedCorrect: count(
					sql`CASE WHEN ${pollOptionsTable.correct} = true THEN 1 END`
				).mapWith(Number),
				selectedIncorrect: count(
					sql`CASE WHEN ${pollOptionsTable.correct} = false THEN 1 END`
				).mapWith(Number),
			})
			.from(pollResponsesTable)
			.innerJoin(
				pollResponseOptionsTable,
				eq(pollResponsesTable.response_id, pollResponseOptionsTable.response_id)
			)
			.innerJoin(
				pollOptionsTable,
				eq(pollResponseOptionsTable.option_id, pollOptionsTable.id)
			)
			.where(
				and(
					eq(pollResponsesTable.user_id, userId),
					inArray(pollResponsesTable.poll_id, pollIds),
					sql`${pollResponsesTable.response_id} = (
						SELECT MAX(pr2.response_id)
						FROM polls_responses pr2
						WHERE pr2.poll_id = ${pollResponsesTable.poll_id}
						AND pr2.user_id = ${userId}
					)`
				)
			)
			.groupBy(pollResponsesTable.poll_id),

		db
			.select({
				pollId: pollOptionsTable.poll_id,
				totalCorrect: count().mapWith(Number),
			})
			.from(pollOptionsTable)
			.where(
				and(
					eq(pollOptionsTable.correct, true),
					inArray(pollOptionsTable.poll_id, pollIds)
				)
			)
			.groupBy(pollOptionsTable.poll_id),
	]);

	const correctnessMap = new Map(correctnessResults.map((r) => [r.pollId, r]));
	const totalCorrectMap = new Map(
		totalCorrectResults.map((r) => [r.pollId, r.totalCorrect])
	);

	return historyResults.map((row) => {
		const correctness = correctnessMap.get(row.pollId);
		const totalCorrect = totalCorrectMap.get(row.pollId) ?? 0;

		const outcome: PollAnswerOutcome =
			row.timesAnswered === 0 || correctness === undefined
				? "wrong"
				: evaluatePollAnswer({
						selectedCorrect: correctness.selectedCorrect,
						selectedIncorrect: correctness.selectedIncorrect,
						totalCorrect,
					}).outcome;

		return {
			pollId: row.pollId,
			categoryCode: row.categoryCode,
			answeredAt: row.timesAnswered === 0 ? null : row.answeredAt,
			outcome,
		};
	});
};

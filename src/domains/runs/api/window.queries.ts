import { eq, and, desc, count, sql, inArray } from "drizzle-orm";

import {
	pollResponsesTable,
	pollResponseOptionsTable,
	pollOptionsTable,
	pollsTable,
} from "@/src/database/schema";
import { db } from "~/database/db";
import { evaluatePollAnswer } from "~/domains/polls/services/pollAnswerEvaluation.service";
import type { CategoryCode } from "~/domains/shared/categories";

export type WindowResult = {
	isCorrect: boolean;
	isWrong: boolean;
	coverageDelta: number;
	categoryCode: CategoryCode;
};

export const getWindowResults = async (
	runId: number,
	userId: string,
	windowSize: number
): Promise<WindowResult[]> => {
	const recentResponses = await db
		.select({
			responseId: pollResponsesTable.response_id,
			pollId: pollResponsesTable.poll_id,
			coverageDelta: pollResponsesTable.coverage_delta,
			categoryCode: pollsTable.category_code,
		})
		.from(pollResponsesTable)
		.innerJoin(pollsTable, eq(pollResponsesTable.poll_id, pollsTable.id))
		.where(
			and(
				eq(pollResponsesTable.run_id, runId),
				eq(pollResponsesTable.user_id, userId)
			)
		)
		.orderBy(desc(pollResponsesTable.created_at))
		.limit(windowSize);

	if (recentResponses.length === 0) return [];

	const responseIds = recentResponses.map((r) => r.responseId);
	const pollIds = recentResponses.map((r) => r.pollId);

	const [selectednessResults, totalCorrectResults] = await Promise.all([
		db
			.select({
				responseId: pollResponseOptionsTable.response_id,
				selectedCorrect: count(
					sql`CASE WHEN ${pollOptionsTable.correct} = true THEN 1 END`
				).mapWith(Number),
				selectedIncorrect: count(
					sql`CASE WHEN ${pollOptionsTable.correct} = false THEN 1 END`
				).mapWith(Number),
			})
			.from(pollResponseOptionsTable)
			.innerJoin(
				pollOptionsTable,
				eq(pollResponseOptionsTable.option_id, pollOptionsTable.id)
			)
			.where(inArray(pollResponseOptionsTable.response_id, responseIds))
			.groupBy(pollResponseOptionsTable.response_id),

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

	const selectednessMap = new Map(
		selectednessResults.map((r) => [r.responseId, r])
	);
	const totalCorrectMap = new Map(
		totalCorrectResults.map((r) => [r.pollId, r.totalCorrect])
	);

	return recentResponses.map(
		({ responseId, pollId, coverageDelta, categoryCode }) => {
			const sel = selectednessMap.get(responseId);
			const totalCorrect = totalCorrectMap.get(pollId) ?? 0;
			const category = (categoryCode ?? "general-frontend") as CategoryCode;

			if (!sel || totalCorrect === 0)
				return {
					isCorrect: false,
					isWrong: false,
					coverageDelta: coverageDelta ?? 0,
					categoryCode: category,
				};

			const evaluation = evaluatePollAnswer({
				selectedCorrect: sel.selectedCorrect,
				selectedIncorrect: sel.selectedIncorrect,
				totalCorrect,
			});

			return {
				isCorrect: evaluation.isFullyCorrect,
				isWrong: sel.selectedIncorrect > 0,
				coverageDelta: coverageDelta ?? 0,
				categoryCode: category,
			};
		}
	);
};

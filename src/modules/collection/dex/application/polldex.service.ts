import {
	answerOutcome,
	type AnswerType,
	mirrorGrading,
} from "~/modules/run/run/domain/runPoll.model";
import { isCategoryCode } from "~/shared/lib/categories";
import { handleApiOperation } from "~/shared/utils/errorHandling";

import {
	isSeenPoll,
	sortByDexNumber,
	timesSeenOf,
	type PolldexEntry,
} from "~/modules/collection/dex/domain/polldex.model";
import {
	fetchAnswerCorrectnessByUser,
	fetchPublishedPollsForDex,
	fetchSeenCountsByUser,
	type PolldexCorrectnessRow,
} from "~/modules/collection/dex/infrastructure/polldex.repository";

type GradedResponse = {
	readonly pollId: number;
	readonly mirrored: boolean;
	readonly answerType: AnswerType;
	readonly options: readonly {
		readonly id: number;
		readonly correct: boolean;
		readonly group?: number;
	}[];
	readonly picked: readonly number[];
};

type PollAccuracy = {
	readonly answeredCount: number;
	readonly fullyCorrect: number;
};

const responsesOf = (
	rows: readonly PolldexCorrectnessRow[]
): readonly GradedResponse[] => {
	const byResponse = rows.reduce((responses, row) => {
		const current = responses.get(row.responseId) ?? {
			pollId: row.pollId,
			mirrored: row.mirrored,
			answerType: row.answerType,
			options: [],
			picked: [],
		};
		return responses.set(row.responseId, {
			...current,
			options: [
				...current.options,
				{
					id: row.optionId,
					correct: row.optionCorrect,
					...(row.optionGroup === null ? {} : { group: row.optionGroup }),
				},
			],
			picked:
				row.optionSelected === null
					? current.picked
					: [...current.picked, row.optionSelected],
		});
	}, new Map<number, GradedResponse>());

	return [...byResponse.values()];
};

const isFullyCorrect = (response: GradedResponse): boolean => {
	const graded = { answerType: response.answerType, options: response.options };
	const key = response.mirrored ? mirrorGrading(graded) : graded;
	return answerOutcome(key, response.picked) === "correct";
};

const accuracyByPoll = (
	responses: readonly GradedResponse[]
): Map<number, PollAccuracy> =>
	responses.reduce((byPoll, response) => {
		const stats = byPoll.get(response.pollId) ?? {
			answeredCount: 0,
			fullyCorrect: 0,
		};
		return byPoll.set(response.pollId, {
			answeredCount: stats.answeredCount + 1,
			fullyCorrect: stats.fullyCorrect + (isFullyCorrect(response) ? 1 : 0),
		});
	}, new Map<number, PollAccuracy>());

export const getPolldexService = async ({ userId }: { userId: string }) =>
	handleApiOperation(async () => {
		const [polls, seenRows, correctnessRows] = await Promise.all([
			fetchPublishedPollsForDex(),
			fetchSeenCountsByUser(userId),
			fetchAnswerCorrectnessByUser(userId),
		]);

		const seenByPoll = new Map(
			seenRows.map((row) => [row.pollId, row.timesSeen])
		);
		const accuracy = accuracyByPoll(responsesOf(correctnessRows));

		const entries: PolldexEntry[] = polls.flatMap((poll) => {
			if (!isCategoryCode(poll.categoryCode)) return [];

			const viewCount = seenByPoll.get(poll.id) ?? 0;
			const answered = accuracy.get(poll.id);
			const answeredCount = answered?.answeredCount ?? 0;
			const timesSeen = timesSeenOf(viewCount, answeredCount);
			const seen = isSeenPoll({ timesSeen });

			return [
				{
					id: poll.id,
					pollNumber: poll.pollNumber,
					categoryCode: poll.categoryCode,
					seen,
					question: seen ? poll.question : null,
					timesSeen,
					answeredCount,
					correctCount: answered?.fullyCorrect ?? 0,
					accuracy:
						answered && answeredCount > 0
							? Math.round((answered.fullyCorrect / answeredCount) * 100)
							: null,
				},
			];
		});

		return { entries: sortByDexNumber(entries) };
	}, "getPolldex");

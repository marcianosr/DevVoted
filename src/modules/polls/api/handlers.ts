import { evaluatePollAnswer } from "~/domains/polls/services/pollAnswerEvaluation.service";
import { isCategoryCode } from "~/domains/shared/categories";
import { handleApiOperation } from "~/utils/errorHandling";

import { sortByDexNumber, type PolldexEntry } from "../polldex/polldex.model";
import {
	fetchAnswerCorrectnessByUser,
	fetchPublishedPollsForDex,
	fetchSeenCountsByUser,
	type PolldexCorrectnessRow,
} from "./queries";

type ResponseTally = {
	pollId: number;
	selectedCorrect: number;
	selectedIncorrect: number;
	totalCorrect: number;
};

type PollAccuracy = {
	answeredCount: number;
	fullyCorrect: number;
};

/** Fold per-(response,option) rows into per-response tallies keyed by responseId. */
const tallyResponses = (
	rows: PolldexCorrectnessRow[]
): Map<number, ResponseTally> => {
	const tallies = new Map<number, ResponseTally>();
	for (const row of rows) {
		const tally = tallies.get(row.responseId) ?? {
			pollId: row.pollId,
			selectedCorrect: 0,
			selectedIncorrect: 0,
			totalCorrect: 0,
		};
		if (row.optionCorrect) tally.totalCorrect += 1;
		const selected = row.optionSelected !== null;
		if (selected && row.optionCorrect) tally.selectedCorrect += 1;
		if (selected && !row.optionCorrect) tally.selectedIncorrect += 1;
		tallies.set(row.responseId, tally);
	}
	return tallies;
};

/** Per-poll answered count + fully-correct count, reusing the shared rule. */
const accuracyByPoll = (
	tallies: Map<number, ResponseTally>
): Map<number, PollAccuracy> => {
	const byPoll = new Map<number, PollAccuracy>();
	for (const tally of tallies.values()) {
		const stats = byPoll.get(tally.pollId) ?? {
			answeredCount: 0,
			fullyCorrect: 0,
		};
		stats.answeredCount += 1;
		if (evaluatePollAnswer(tally).isFullyCorrect) stats.fullyCorrect += 1;
		byPoll.set(tally.pollId, stats);
	}
	return byPoll;
};

export const getPolldexHandler = async ({ userId }: { userId: string }) =>
	handleApiOperation(async () => {
		const [polls, seenRows, correctnessRows] = await Promise.all([
			fetchPublishedPollsForDex(),
			fetchSeenCountsByUser(userId),
			fetchAnswerCorrectnessByUser(userId),
		]);

		const seenByPoll = new Map(
			seenRows.map((row) => [row.pollId, row.timesSeen])
		);
		const accuracy = accuracyByPoll(tallyResponses(correctnessRows));

		const entries: PolldexEntry[] = polls.flatMap((poll) => {
			if (!isCategoryCode(poll.categoryCode)) return [];

			const viewCount = seenByPoll.get(poll.id) ?? 0;
			const answered = accuracy.get(poll.id);
			const answeredCount = answered?.answeredCount ?? 0;
			// Answering a poll counts as seeing it: daily/calendar answers write no
			// run-scoped history row, so views alone read 0 for a poll you answered.
			const timesSeen = Math.max(viewCount, answeredCount);
			const seen = timesSeen > 0;

			return [
				{
					id: poll.id,
					pollNumber: poll.pollNumber,
					categoryCode: poll.categoryCode,
					seen,
					// Redact the question text for unseen polls — never crosses the wire.
					question: seen ? poll.question : null,
					timesSeen,
					answeredCount,
					accuracy:
						answered && answeredCount > 0
							? Math.round((answered.fullyCorrect / answeredCount) * 100)
							: null,
				},
			];
		});

		return { entries: sortByDexNumber(entries) };
	});

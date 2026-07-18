import { type ApiResponse, handleApiOperation } from "~/utils/errorHandling";

import type { AnswerOutcome } from "../climb/run.model";
import {
	type CommunityPollRecord,
	fetchConsumedPollsForDay,
	fetchPollsWithOptions,
	fetchRunProgress,
	fetchSessionAnswersForDay,
	type SessionAnswerRow,
} from "./community.queries";
import { findActiveSessionRun, findSessionRunByDate } from "./queries";

export type CommunityVoter = {
	id: string;
	displayName: string;
};

export type RunCommunityPollDetail = {
	yourPickLabels: string[];
	correctLabels: string[];
	agreedPercent: number;
	gotItRightPercent: number;
	answeredCount: number;
	gotItRightVoters: CommunityVoter[];
	pickedYoursVoters: CommunityVoter[];
};

export type RunCommunityPoll = {
	pollId: number;
	index: number;
	question: string;
	outcome: AnswerOutcome | "missed";
	/** Absent for missed polls: they may reappear in a later seed, so nothing may be revealed. */
	detail: RunCommunityPollDetail | null;
};

export type RunCommunityView = {
	date: string;
	totalPlayers: number;
	/** "top X% of players today" — null until the viewer answered something today. */
	topPercent: number | null;
	polls: RunCommunityPoll[];
};

type SessionAnswer = {
	pollId: number;
	user: CommunityVoter;
	optionIds: Set<number>;
};

const groupAnswers = (rows: SessionAnswerRow[]): SessionAnswer[] => {
	const byResponse = new Map<number, SessionAnswer>();
	for (const row of rows) {
		if (!row.userId) continue;
		const answer = byResponse.get(row.responseId) ?? {
			pollId: row.pollId,
			user: { id: row.userId, displayName: row.displayName ?? row.userId },
			optionIds: new Set<number>(),
		};
		if (row.optionId !== null) answer.optionIds.add(row.optionId);
		byResponse.set(row.responseId, answer);
	}
	return [...byResponse.values()];
};

const sameSet = (a: Set<number>, b: Set<number>): boolean =>
	a.size === b.size && [...a].every((value) => b.has(value));

/** Mirrors the engine's answerOutcome: partial exists only on multi-answer polls. */
const outcomeOf = (
	poll: CommunityPollRecord,
	picked: Set<number>
): AnswerOutcome => {
	const correctIds = new Set(
		poll.options.filter((option) => option.correct).map((option) => option.id)
	);
	if (sameSet(picked, correctIds)) return "correct";
	if (poll.answerType === "single") return "wrong";
	const anyCorrectPicked = poll.options.some(
		(option) => option.correct && picked.has(option.id)
	);
	return anyCorrectPicked ? "partial" : "wrong";
};

const toPercent = (part: number, total: number): number =>
	total === 0 ? 0 : Math.round((part / total) * 100);

const labelsOf = (poll: CommunityPollRecord, ids: Set<number>): string[] =>
	poll.options
		.filter((option) => ids.has(option.id))
		.map((option) => option.label);

const buildPollDetail = (
	poll: CommunityPollRecord,
	viewerAnswer: SessionAnswer,
	pollAnswers: SessionAnswer[]
): RunCommunityPollDetail => {
	const agreeing = pollAnswers.filter((answer) =>
		sameSet(answer.optionIds, viewerAnswer.optionIds)
	);
	const gotItRight = pollAnswers.filter(
		(answer) => outcomeOf(poll, answer.optionIds) === "correct"
	);

	return {
		yourPickLabels: labelsOf(poll, viewerAnswer.optionIds),
		correctLabels: poll.options
			.filter((option) => option.correct)
			.map((option) => option.label),
		agreedPercent: toPercent(agreeing.length, pollAnswers.length),
		gotItRightPercent: toPercent(gotItRight.length, pollAnswers.length),
		answeredCount: pollAnswers.length,
		gotItRightVoters: gotItRight.map((answer) => answer.user),
		pickedYoursVoters: agreeing.map((answer) => answer.user),
	};
};

/** "top 18%": players with a better correct-count today push you down. */
const topPercentFor = (
	viewerId: string,
	polls: CommunityPollRecord[],
	answers: SessionAnswer[]
): number | null => {
	const pollsById = new Map(polls.map((poll) => [poll.id, poll]));
	const correctByUser = new Map<string, number>();
	for (const answer of answers) {
		const poll = pollsById.get(answer.pollId);
		if (!poll) continue;
		const isCorrect = outcomeOf(poll, answer.optionIds) === "correct";
		correctByUser.set(
			answer.user.id,
			(correctByUser.get(answer.user.id) ?? 0) + (isCorrect ? 1 : 0)
		);
	}
	const viewerScore = correctByUser.get(viewerId);
	if (viewerScore === undefined) return null;

	const scores = [...correctByUser.values()];
	const better = scores.filter((score) => score > viewerScore).length;
	return Math.max(1, Math.ceil(((better + 1) / scores.length) * 100));
};

const EMPTY_VIEW = (date: string): RunCommunityView => ({
	date,
	totalPlayers: 0,
	topPercent: null,
	polls: [],
});

export const getRunCommunityHandler = async ({
	userId,
	date,
}: {
	userId: string;
	date: string;
}): Promise<ApiResponse<RunCommunityView>> =>
	handleApiOperation(async () => {
		const run =
			(await findActiveSessionRun(userId)) ??
			(await findSessionRunByDate(userId, date));
		if (!run) return EMPTY_VIEW(date);

		const currentIndex = await fetchRunProgress(run.id);
		const consumed = await fetchConsumedPollsForDay(run.id, date, currentIndex);
		if (consumed.length === 0) return EMPTY_VIEW(date);

		const answerRows = await fetchSessionAnswersForDay(date);
		const answers = groupAnswers(answerRows);
		const dayPollIds = [...new Set(answers.map((answer) => answer.pollId))];
		const polls = await fetchPollsWithOptions([
			...new Set([...consumed.map((entry) => entry.poll_id), ...dayPollIds]),
		]);
		const pollsById = new Map(polls.map((poll) => [poll.id, poll]));

		const views = consumed.map((entry, index): RunCommunityPoll => {
			const poll = pollsById.get(entry.poll_id);
			if (!poll)
				throw new Error(`Poll ${entry.poll_id} missing for community view`);

			const pollAnswers = answers.filter(
				(answer) => answer.pollId === entry.poll_id
			);
			const viewerAnswer = pollAnswers.find(
				(answer) => answer.user.id === userId
			);

			// Linted/skipped: the poll may reappear in a later seed for this
			// player — reveal nothing beyond its existence.
			if (!viewerAnswer) {
				return {
					pollId: poll.id,
					index,
					question: poll.question,
					outcome: "missed",
					detail: null,
				};
			}

			return {
				pollId: poll.id,
				index,
				question: poll.question,
				outcome: outcomeOf(poll, viewerAnswer.optionIds),
				detail: buildPollDetail(poll, viewerAnswer, pollAnswers),
			};
		});

		return {
			date,
			totalPlayers: new Set(answers.map((answer) => answer.user.id)).size,
			topPercent: topPercentFor(userId, polls, answers),
			polls: views,
		};
	});

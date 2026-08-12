import { isCategoryCode } from "~/domains/shared/categories";
import { type ApiResponse, handleApiOperation } from "~/utils/errorHandling";

import type { CategoryCode } from "~/domains/shared/categories";

import {
	type ClimbMarker,
	trackPosition,
} from "~/modules/run/community/domain/climbMap.model";
import type {
	AnswerOutcome,
	AnswerType,
} from "~/modules/run/run/domain/run.model";
import {
	fetchActiveClimbers,
	fetchActiveRunStats,
	fetchClimbMarker,
	fetchFallenToday,
	fetchPersonalBestPosition,
} from "~/modules/run/community/infrastructure/climbers.repository";
import {
	type CommunityPollRecord,
	type ConsumedRunPoll,
	fetchConsumedPollsForDay,
	fetchDailySeedCreatedAt,
	fetchPollsWithOptions,
	fetchRunProgress,
	fetchSessionAnswersForDay,
	type SessionAnswerRow,
} from "~/modules/run/community/infrastructure/community.repository";
import {
	findActiveSessionRun,
	findSessionRunByDate,
} from "~/modules/run/run/infrastructure/run.repository";
import {
	type CommunityAnswer,
	type CommunityStandout,
	type CommunityVoter,
	standoutsFor,
} from "~/modules/run/community/domain/standouts.model";

export type {
	CommunityStandout,
	CommunityVoter,
} from "~/modules/run/community/domain/standouts.model";

/**
 * One answer option with its community result. Named `isRight` (not `correct`)
 * on purpose: the payload tripwire spec rejects any `"correct":` key, guarding
 * against a raw DB option record leaking into the response.
 */
export type CommunityOptionResult = {
	label: string;
	isRight: boolean;
	count: number;
	/** Share of this poll's answerers, 0–100. Multi-answer polls may sum past 100. */
	percent: number;
	yours: boolean;
	/** Everyone who picked this option, viewer first. */
	voters: CommunityVoter[];
};

export type RunCommunityPollDetail = {
	answerType: AnswerType;
	answeredCount: number;
	gotItRightCount: number;
	youGotItRight: boolean;
	options: CommunityOptionResult[];
};

export type RunCommunityPoll = {
	pollId: number;
	index: number;
	question: string;
	/** The category swatch next to the question — null for missed polls (sealed). */
	category: CategoryCode | null;
	outcome: AnswerOutcome | "missed";
	/** Absent for missed polls: they may reappear in a later seed, so nothing may be revealed. */
	detail: RunCommunityPollDetail | null;
};

/** One player's live position on the climb map. */
export type ClimbClimber = ClimbMarker & {
	id: string;
	displayName: string;
	photoUrl?: string | null;
	/** The viewer's own marker — drawn exactly once, however their run ended. */
	you: boolean;
};

/**
 * A run the gate killed today, drawn as its player greyed out where they fell.
 * Keyed by run rather than by player: one player can lose more than one run in
 * a day, and each loss happened somewhere different.
 */
export type ClimbFallen = ClimbMarker & {
	runId: number;
	id: string;
	displayName: string;
	photoUrl?: string | null;
};

export type ClimbTodayView = {
	climbers: ClimbClimber[];
	fallen: ClimbFallen[];
	/** Deepest position any finished run of the viewer's reached — null on a first climb. */
	bestPosition: number | null;
};

export type RunCommunityView = {
	date: string;
	totalPlayers: number;
	/** "top X% of players today" — null until the viewer answered something today. */
	topPercent: number | null;
	standouts: CommunityStandout[];
	polls: RunCommunityPoll[];
	/** The climb map — null when the viewer has no run to place themselves on. */
	climb: ClimbTodayView | null;
};

const groupAnswers = (rows: SessionAnswerRow[]): CommunityAnswer[] => {
	const byResponse = new Map<number, CommunityAnswer>();
	for (const row of rows) {
		if (!row.userId) continue;
		const answer = byResponse.get(row.responseId) ?? {
			pollId: row.pollId,
			user: {
				id: row.userId,
				displayName: row.displayName ?? row.userId,
				photoUrl: row.photoUrl,
			},
			optionIds: new Set<number>(),
			categoryCode: row.categoryCode,
			answeredAt: row.answeredAt,
			elapsedMs: row.answerTimeMs,
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

const viewerFirst = (voters: CommunityVoter[]): CommunityVoter[] =>
	[...voters].sort((a, b) => Number(b.you) - Number(a.you));

const buildPollDetail = (
	poll: CommunityPollRecord,
	viewerAnswer: CommunityAnswer,
	pollAnswers: CommunityAnswer[]
): RunCommunityPollDetail => {
	const gotItRight = pollAnswers.filter(
		(answer) => outcomeOf(poll, answer.optionIds) === "correct"
	);

	return {
		answerType: poll.answerType,
		answeredCount: pollAnswers.length,
		gotItRightCount: gotItRight.length,
		youGotItRight: gotItRight.some(
			(answer) => answer.user.id === viewerAnswer.user.id
		),
		options: poll.options.map((option): CommunityOptionResult => {
			const pickers = pollAnswers.filter((answer) =>
				answer.optionIds.has(option.id)
			);
			return {
				label: option.label,
				isRight: option.correct,
				count: pickers.length,
				percent: toPercent(pickers.length, pollAnswers.length),
				yours: viewerAnswer.optionIds.has(option.id),
				voters: viewerFirst(
					pickers.map((answer) => ({
						...answer.user,
						you: answer.user.id === viewerAnswer.user.id,
					}))
				),
			};
		}),
	};
};

/** "top 18%": players with a better correct-count today push you down. */
const topPercentFor = (
	viewerId: string,
	polls: CommunityPollRecord[],
	answers: CommunityAnswer[]
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

const EMPTY_VIEW = (
	date: string,
	climb: ClimbTodayView | null,
	standouts: CommunityStandout[] = []
): RunCommunityView => ({
	date,
	totalPlayers: 0,
	topPercent: null,
	standouts,
	polls: [],
	climb,
});

/**
 * The day's awards, gathered for the model. Run-scoped awards read live runs
 * rather than today's answers, so this is built before the poll board's early
 * return — a player who has not answered yet still holds the deepest gate.
 */
const buildStandouts = async ({
	answers,
	consumed,
	pollsById,
	seedCreatedAt,
	viewerId,
}: {
	answers: CommunityAnswer[];
	consumed: ConsumedRunPoll[];
	pollsById: Map<number, CommunityPollRecord>;
	seedCreatedAt: Date | null;
	viewerId: string;
}): Promise<CommunityStandout[]> => {
	const runStats = await fetchActiveRunStats();
	return standoutsFor({
		answers,
		// Only what the viewer is past may be named — the same redaction the
		// poll board applies.
		eligiblePolls: consumed.flatMap((entry) => {
			const poll = pollsById.get(entry.poll_id);
			return poll ? [{ id: poll.id, question: poll.question }] : [];
		}),
		isCorrect: (pollId, optionIds) => {
			const poll = pollsById.get(pollId);
			return poll ? outcomeOf(poll, new Set(optionIds)) === "correct" : false;
		},
		seedCreatedAt,
		runStats: runStats.map((row) => ({
			user: {
				id: row.userId,
				displayName: row.displayName ?? row.userId,
				photoUrl: row.photoUrl,
			},
			gatesCleared: row.gatesCleared,
			coverage: row.coverage,
			configCount: row.configCount,
			outcomes: row.outcomes,
			streak: row.streak,
		})),
		viewerId,
	});
};

/**
 * One marker per player. A user with more than one live run (the schema allows
 * it even though the loop does not) keeps their deepest, so the map never draws
 * the same person twice.
 */
const deepestPerUser = (climbers: ClimbClimber[]): ClimbClimber[] => {
	const byUser = new Map<string, ClimbClimber>();
	for (const climber of climbers) {
		const held = byUser.get(climber.id);
		if (!held || trackPosition(climber) > trackPosition(held))
			byUser.set(climber.id, climber);
	}
	return [...byUser.values()].sort(
		(a, b) => trackPosition(a) - trackPosition(b)
	);
};

const buildClimbToday = async ({
	userId,
	date,
	viewerAt,
}: {
	userId: string;
	date: string;
	/** The viewer's own position, so they appear even once their run is over. */
	viewerAt: ClimbMarker;
}): Promise<ClimbTodayView> => {
	const [active, fallen, bestPosition] = await Promise.all([
		fetchActiveClimbers(),
		fetchFallenToday(date),
		fetchPersonalBestPosition(userId),
	]);

	const others = active
		.filter((row) => row.userId !== userId)
		.map((row): ClimbClimber => ({
			id: row.userId,
			displayName: row.displayName ?? row.userId,
			photoUrl: row.photoUrl,
			gate: row.gate,
			pollsIntoGate: row.pollsIntoGate,
			you: false,
		}));

	// The viewer's marker comes from their own run, not the active-climber list:
	// a run that died today has left that list but still belongs on the map.
	const viewerRow = active.find((row) => row.userId === userId);
	const viewer: ClimbClimber = {
		id: userId,
		displayName: viewerRow?.displayName ?? "you",
		photoUrl: viewerRow?.photoUrl,
		...viewerAt,
		you: true,
	};

	return {
		climbers: deepestPerUser([...others, viewer]),
		fallen: fallen.map((row) => ({
			runId: row.runId,
			id: row.userId,
			displayName: row.displayName ?? row.userId,
			photoUrl: row.photoUrl,
			gate: row.gate,
			pollsIntoGate: row.pollsIntoGate,
		})),
		bestPosition,
	};
};

export const getRunCommunityService = async ({
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
		if (!run) return EMPTY_VIEW(date, null);

		// Built before the poll board's early returns: the map has something to say
		// from the moment a run exists, including on a day with nothing answered yet.
		const viewerAt = await fetchClimbMarker(run.id);
		const climb = viewerAt
			? await buildClimbToday({ userId, date, viewerAt })
			: null;

		const currentIndex = await fetchRunProgress(run.id);
		const consumed = await fetchConsumedPollsForDay(run.id, date, currentIndex);

		const answerRows = await fetchSessionAnswersForDay(date);
		const answers = groupAnswers(answerRows);
		const seedCreatedAt = await fetchDailySeedCreatedAt(date);
		const dayPollIds = [...new Set(answers.map((answer) => answer.pollId))];
		const polls = await fetchPollsWithOptions([
			...new Set([...consumed.map((entry) => entry.poll_id), ...dayPollIds]),
		]);
		const pollsById = new Map(polls.map((poll) => [poll.id, poll]));

		// Ahead of the board's early return: the run-scoped awards stand on live
		// runs, not on whether the viewer has answered anything today.
		const standouts = await buildStandouts({
			answers,
			consumed,
			pollsById,
			seedCreatedAt,
			viewerId: userId,
		});
		if (consumed.length === 0) return EMPTY_VIEW(date, climb, standouts);

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
					category: null,
					outcome: "missed",
					detail: null,
				};
			}

			return {
				pollId: poll.id,
				index,
				question: poll.question,
				category: isCategoryCode(poll.categoryCode) ? poll.categoryCode : null,
				outcome: outcomeOf(poll, viewerAnswer.optionIds),
				detail: buildPollDetail(poll, viewerAnswer, pollAnswers),
			};
		});

		return {
			date,
			totalPlayers: new Set(answers.map((answer) => answer.user.id)).size,
			topPercent: topPercentFor(userId, polls, answers),
			standouts,
			polls: views,
			climb,
		};
	});

import { isCategoryCode } from "~/shared/lib/categories";
import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import type { CategoryCode } from "~/shared/lib/categories";

import type { PublicBuild } from "~/modules/run/build/domain/publicBuild.model";
import {
	type CoverageBandId,
	percentOf,
	runCoverageOf,
} from "~/modules/run/build/domain/coverageRatio.model";

import {
	type ClimbMarker,
	trackPosition,
} from "~/modules/run/community/domain/climbMap.model";
import {
	answerOutcome,
	type AnswerOutcome,
	type AnswerType,
	mirrorGrading,
} from "~/modules/run/run/domain/runPoll.model";
import {
	type ClimberRow,
	fetchActiveClimbers,
	fetchBestCategories,
	fetchClimbMarker,
	fetchFallenToday,
	fetchPersonalBestPosition,
} from "~/modules/run/community/infrastructure/climbers.repository";
import {
	type CommunityPollRecord,
	fetchConsumedPollsForDay,
	fetchPollsWithOptions,
	fetchRunProgress,
	fetchSessionAnswersForDay,
	type SessionAnswerRow,
} from "~/modules/run/community/infrastructure/community.repository";
import {
	findActiveSessionRun,
	findSessionRunByDate,
} from "~/modules/run/run/infrastructure/run.repository";
import type { CommunityVoter } from "~/modules/run/community/domain/voter.model";
import {
	type CategorySeat,
	seatsFor,
} from "~/modules/run/run/domain/categoryLeader.model";
import { fetchCategoryLeaders } from "~/modules/run/run/infrastructure/categoryLeader.repository";

export type { CommunityVoter } from "~/modules/run/community/domain/voter.model";

type Player = {
	id: string;
	displayName: string;
	photoUrl: string | null;
	borderUrl: string | null;
};

type CommunityAnswer = {
	pollId: number;
	user: Player;
	optionIds: Set<number>;
	mirrored: boolean;
};

export type CommunityOptionResult = {
	label: string;
	isRight: boolean;
	count: number;
	percent: number;
	yours: boolean;
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
	category: CategoryCode | null;
	outcome: AnswerOutcome | "missed";
	detail: RunCommunityPollDetail | null;
};

export type ClimbStanding = {
	handle?: string;
	title?: string;
	coveragePercent?: number;
	streak?: number;
	storageKb?: number;
	bestCategory?: string;
};

export type ClimbClimber = ClimbMarker & {
	id: string;
	displayName: string;
	photoUrl?: string | null;
	borderUrl?: string | null;
	you: boolean;
	build?: PublicBuild;
	closingBand?: CoverageBandId;
	startedAtGate?: number;
} & ClimbStanding;

export type ClimbFallen = ClimbMarker &
	ClimbStanding & {
		runId: number;
		id: string;
		displayName: string;
		photoUrl?: string | null;
		borderUrl?: string | null;
		build: PublicBuild;
		closingBand?: CoverageBandId;
		startedAtGate: number;
	};

export type ClimbTodayView = {
	climbers: ClimbClimber[];
	fallen: ClimbFallen[];
	bestPosition: number | null;
};

export type RunCommunityView = {
	date: string;
	totalPlayers: number;
	topPercent: number | null;
	leaders: CategorySeat[];
	polls: RunCommunityPoll[];
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
				borderUrl: row.borderUrl,
			},
			optionIds: new Set<number>(),
			mirrored: row.mirrored,
		};
		if (row.optionId !== null) answer.optionIds.add(row.optionId);
		byResponse.set(row.responseId, answer);
	}
	return [...byResponse.values()];
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
		(answer) =>
			answerOutcome(
				answer.mirrored ? mirrorGrading(poll) : poll,
				answer.optionIds
			) === "correct"
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
		const isCorrect =
			answerOutcome(
				answer.mirrored ? mirrorGrading(poll) : poll,
				answer.optionIds
			) === "correct";
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
	leaders: CategorySeat[] = []
): RunCommunityView => ({
	date,
	totalPlayers: 0,
	topPercent: null,
	leaders,
	polls: [],
	climb,
});

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

const closeOf = ({
	closingBand,
	startedAtGate,
}: Pick<ClimberRow, "closingBand" | "startedAtGate">) => ({
	...(closingBand === null ? {} : { closingBand }),
	startedAtGate,
});

const standingOf = (
	row: ClimberRow,
	bestCategory: string | undefined
): ClimbStanding => ({
	...(row.handle === null ? {} : { handle: row.handle }),
	...(row.title === null ? {} : { title: row.title }),
	coveragePercent: Math.round(
		percentOf(runCoverageOf(row.coverageUnits, row.gate))
	),
	streak: row.streak,
	storageKb: row.storageKb,
	...(bestCategory === undefined ? {} : { bestCategory }),
});

const buildClimbToday = async ({
	userId,
	date,
	viewerAt,
}: {
	userId: string;
	date: string;
	viewerAt: ClimbMarker;
}): Promise<ClimbTodayView> => {
	const [active, fallen, bestPosition] = await Promise.all([
		fetchActiveClimbers(),
		fetchFallenToday(date),
		fetchPersonalBestPosition(userId),
	]);
	const bestCategories = await fetchBestCategories([
		...new Set([...active, ...fallen].map((row) => row.userId)),
	]);

	const others = active
		.filter((row) => row.userId !== userId)
		.map((row): ClimbClimber => ({
			id: row.userId,
			displayName: row.displayName ?? row.userId,
			photoUrl: row.photoUrl,
			borderUrl: row.borderUrl,
			gate: row.gate,
			pollsIntoGate: row.pollsIntoGate,
			you: false,
			build: row.build,
			...closeOf(row),
			...standingOf(row, bestCategories.get(row.userId)),
		}));

	const viewerRow = active.find((row) => row.userId === userId);
	const viewer: ClimbClimber = {
		id: userId,
		displayName: viewerRow?.displayName ?? "you",
		photoUrl: viewerRow?.photoUrl,
		borderUrl: viewerRow?.borderUrl,
		...viewerAt,
		you: true,
		...(viewerRow === undefined
			? {}
			: {
					build: viewerRow.build,
					...closeOf(viewerRow),
					...standingOf(viewerRow, bestCategories.get(userId)),
				}),
	};

	return {
		climbers: deepestPerUser([...others, viewer]),
		fallen: fallen.map((row) => ({
			runId: row.runId,
			id: row.userId,
			displayName: row.displayName ?? row.userId,
			photoUrl: row.photoUrl,
			borderUrl: row.borderUrl,
			gate: row.gate,
			pollsIntoGate: row.pollsIntoGate,
			build: row.build,
			...closeOf(row),
			...standingOf(row, bestCategories.get(row.userId)),
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

		const viewerAt = await fetchClimbMarker(run.id);
		const climb = viewerAt
			? await buildClimbToday({ userId, date, viewerAt })
			: null;

		const currentIndex = await fetchRunProgress(run.id);
		const consumed = await fetchConsumedPollsForDay(run.id, date, currentIndex);

		const answerRows = await fetchSessionAnswersForDay(date);
		const answers = groupAnswers(answerRows);
		const dayPollIds = [...new Set(answers.map((answer) => answer.pollId))];
		const polls = await fetchPollsWithOptions([
			...new Set([...consumed.map((entry) => entry.poll_id), ...dayPollIds]),
		]);
		const pollsById = new Map(polls.map((poll) => [poll.id, poll]));

		const leaders = seatsFor(await fetchCategoryLeaders(userId));
		if (consumed.length === 0) return EMPTY_VIEW(date, climb, leaders);

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
				outcome: answerOutcome(
					viewerAnswer.mirrored ? mirrorGrading(poll) : poll,
					viewerAnswer.optionIds
				),
				detail: buildPollDetail(poll, viewerAnswer, pollAnswers),
			};
		});

		return {
			date,
			totalPlayers: new Set(answers.map((answer) => answer.user.id)).size,
			topPercent: topPercentFor(userId, polls, answers),
			leaders,
			polls: views,
			climb,
		};
	}, "getRunCommunity");

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

/** One player's answer to one poll, folded from the day's response rows. */
type CommunityAnswer = {
	pollId: number;
	user: Player;
	optionIds: Set<number>;
	/** Given at a Mirror gate, so the picks answer the inverted poll (ADR-038).
	 * Whoever grades this answer has to invert with it. */
	mirrored: boolean;
};

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

/**
 * How a run is doing, as anyone may read it (ADR-101 §2, narrowed 2026-09-26).
 * Absent on a viewer whose own run has ended: their standing then sits on their
 * fallen chip, beside the build it belonged to.
 */
export type ClimbStanding = {
	/** The GitHub account behind the name, when they have one. */
	handle?: string;
	/** The one title on show (ADR-109). */
	title?: string;
	/** Coverage banked so far, as a whole percentage of what this gate scores against. */
	coveragePercent?: number;
	streak?: number;
	storageKb?: number;
	/** The category they have answered right most often, lifetime. */
	bestCategory?: string;
};

/** One player's live position on the climb map. */
export type ClimbClimber = ClimbMarker & {
	id: string;
	displayName: string;
	photoUrl?: string | null;
	borderUrl?: string | null;
	/** The viewer's own marker — drawn exactly once, however their run ended. */
	you: boolean;
	/** Absent only for a viewer whose run has ended: their build then sits on their fallen chip. */
	build?: PublicBuild;
	/** The band the last gate closed on; absent before a first close, and for a viewer whose run has ended. */
	closingBand?: CoverageBandId;
	/** Where the run began: above 0, a git tag rescued it. Absent for a viewer whose run has ended. */
	startedAtGate?: number;
} & ClimbStanding;

/**
 * A run the gate killed today, drawn as its player greyed out where they fell.
 * Keyed by run rather than by player: one player can lose more than one run in
 * a day, and each loss happened somewhere different.
 */
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
	/** Deepest position any finished run of the viewer's reached — null on a first climb. */
	bestPosition: number | null;
};

export type RunCommunityView = {
	date: string;
	totalPlayers: number;
	/** "top X% of players today" — null until the viewer answered something today. */
	topPercent: number | null;
	leaders: CategorySeat[];
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
	// Knowledge, not opinion (ADR-038): a mirrored answer proves the player knows
	// which options are wrong, so it is graded against the question they were
	// actually asked. The count mixes mirrored and plain answers on purpose —
	// both demonstrate the same knowledge, which is what "got it right" means
	// here. (The paid split cannot mix them and excludes mirrored rows instead.)
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

/** What a chip wears off the run's own record: its last close, and where it began. */
const closeOf = ({
	closingBand,
	startedAtGate,
}: Pick<ClimberRow, "closingBand" | "startedAtGate">) => ({
	...(closingBand === null ? {} : { closingBand }),
	startedAtGate,
});

/**
 * How the run is doing. Coverage leaves the database as the units the column
 * stores and becomes a percentage here, because a percentage needs the gate to
 * divide by and SQL has no business knowing the ladder.
 */
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
	/** The viewer's own position, so they appear even once their run is over. */
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

	// The viewer's marker comes from their own run, not the active-climber list:
	// a run that died today has left that list but still belongs on the map.
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
		const dayPollIds = [...new Set(answers.map((answer) => answer.pollId))];
		const polls = await fetchPollsWithOptions([
			...new Set([...consumed.map((entry) => entry.poll_id), ...dayPollIds]),
		]);
		const pollsById = new Map(polls.map((poll) => [poll.id, poll]));

		// Ahead of the board's early return: the seats stand on an all-time
		// ledger, not on whether the viewer has answered anything today.
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

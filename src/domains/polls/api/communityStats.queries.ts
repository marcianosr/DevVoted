import { eq, and, gte, lt, asc, sql, or, isNull } from "drizzle-orm";

import { db } from "~/database/db";
import {
	pollHistoryTable,
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	runsTable,
	usersTable,
} from "~/database/schema";
import type { PipelineSlot } from "~/domains/runs/models/pipeline.model";
import { getWindowSize } from "~/domains/runs/services/pipelineEvaluator.service";
import type { User } from "~/domains/users/services/userSync.service";

export type CommunityStatsUser = User & {
	answeredAt: Date | null;
	timeTakenMs: number | null;
	responseData: {
		userId: string | null;
		createdAt: Date | null;
		updatedAt: Date | null;
	};
};

export type ActiveRunPlayer = User & {
	currentGate: number;
};

export type FallenRunPlayer = User & {
	currentGate: number;
	finishedAt: Date;
	completionReason: string | null;
};

export type CommunityOptionBreakdown = {
	optionId: number;
	optionText: string;
	isCorrect: boolean;
	voters: CommunityStatsUser[];
};

export type CommunityStats = {
	totalResponses: number;
	users: CommunityStatsUser[];
	firstToAnswer: CommunityStatsUser | null;
	fastestResponder: CommunityStatsUser | null;
	firstGood: CommunityStatsUser | null;
	playersInActiveRun: ActiveRunPlayer[];
	playersFallenOnDate: FallenRunPlayer[];
	optionBreakdown: CommunityOptionBreakdown[];
};

export type RandomDailyAnswer = {
	user: User;
	selectedOptionId: number;
};

export const getCommunityStatsForDailyPoll = async (
	pollId: number,
	date: string
): Promise<CommunityStats> => {
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);

	const startOfNextDay = new Date(startOfDay);
	startOfNextDay.setDate(startOfNextDay.getDate() + 1);

	const result = await db
		.select()
		.from(pollResponsesTable)
		.where(
			and(
				eq(pollResponsesTable.poll_id, pollId),
				gte(pollResponsesTable.created_at, startOfDay),
				lt(pollResponsesTable.created_at, startOfNextDay)
			)
		)
		.orderBy(asc(pollResponsesTable.created_at))
		.leftJoin(usersTable, eq(pollResponsesTable.user_id, usersTable.id))
		.leftJoin(
			pollHistoryTable,
			and(
				eq(pollHistoryTable.poll_id, pollResponsesTable.poll_id),
				eq(pollHistoryTable.user_id, pollResponsesTable.user_id),
				or(
					eq(pollHistoryTable.run_id, pollResponsesTable.run_id),
					isNull(pollResponsesTable.run_id)
				)
			)
		)
		.leftJoin(
			pollResponseOptionsTable,
			eq(pollResponsesTable.response_id, pollResponseOptionsTable.response_id)
		)
		.leftJoin(
			pollOptionsTable,
			eq(pollResponseOptionsTable.option_id, pollOptionsTable.id)
		);

	const usersWithDuplicates = result.flatMap((r) => {
		if (!r.users) return [];

		const firstSeen = r.polls_history?.first_seen_at;
		const answered = r.polls_responses.created_at;
		const timeTakenMs =
			firstSeen && answered ? answered.getTime() - firstSeen.getTime() : null;

		return [
			{
				id: r.users.id,
				email: r.users.email,
				displayName: r.users.display_name,
				photoUrl: r.users.photo_url,
				answeredAt: answered,
				timeTakenMs,
				responseData: {
					userId: r.polls_responses.user_id,
					createdAt: r.polls_responses.created_at,
					updatedAt: r.polls_responses.updated_at,
				},
			},
		];
	});

	const users = [
		...new Map(usersWithDuplicates.map((u) => [u.id, u])).values(),
	];

	const activeRunPlayers = await db
		.select({
			id: usersTable.id,
			email: usersTable.email,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			pipelineSlots: runsTable.pipeline_slots,
			pollsAnswered: sql<number>`COUNT(DISTINCT ${pollResponsesTable.poll_id})::int`,
		})
		.from(runsTable)
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.leftJoin(pollResponsesTable, eq(pollResponsesTable.run_id, runsTable.id))
		.where(eq(runsTable.status, "active"))
		.groupBy(usersTable.id, runsTable.id);

	const playersInActiveRun: ActiveRunPlayer[] = activeRunPlayers.map((row) => {
		const windowSize = getWindowSize(row.pipelineSlots as PipelineSlot[]);
		const currentGate = Math.max(1, Math.ceil(row.pollsAnswered / windowSize));
		return {
			id: row.id,
			email: row.email,
			displayName: row.displayName,
			photoUrl: row.photoUrl,
			currentGate,
		};
	});

	const fallenRunPlayers = await db
		.select({
			id: usersTable.id,
			email: usersTable.email,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			pipelineSlots: runsTable.pipeline_slots,
			finishedAt: runsTable.finished_at,
			completionReason: runsTable.completion_reason,
			pollsAnswered: sql<number>`COUNT(DISTINCT ${pollResponsesTable.poll_id})::int`,
		})
		.from(runsTable)
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.leftJoin(pollResponsesTable, eq(pollResponsesTable.run_id, runsTable.id))
		.where(
			and(
				eq(runsTable.status, "finished"),
				isNull(runsTable.victory_achieved_at),
				gte(runsTable.finished_at, startOfDay),
				lt(runsTable.finished_at, startOfNextDay)
			)
		)
		.groupBy(
			usersTable.id,
			runsTable.id,
			runsTable.finished_at,
			runsTable.completion_reason
		);

	const playersFallenOnDate: FallenRunPlayer[] = fallenRunPlayers.flatMap(
		(row) => {
			if (!row.finishedAt) return [];
			const windowSize = getWindowSize(row.pipelineSlots as PipelineSlot[]);
			const currentGate = Math.max(
				1,
				Math.ceil(row.pollsAnswered / windowSize)
			);
			return [
				{
					id: row.id,
					email: row.email,
					displayName: row.displayName,
					photoUrl: row.photoUrl,
					currentGate,
					finishedAt: row.finishedAt,
					completionReason: row.completionReason,
				},
			];
		}
	);

	const fastestResponder = users.reduce<CommunityStatsUser | null>(
		(fastest, user) => {
			if (user.timeTakenMs === null) return fastest;
			if (fastest === null || fastest.timeTakenMs === null) return user;
			return user.timeTakenMs < fastest.timeTakenMs ? user : fastest;
		},
		null
	);

	const firstGood = () => {
		const goodResponders = result.filter(
			(r) => r.polls_options?.correct === true
		);
		if (goodResponders.length === 0) return null;
		const firstGoodRecord = goodResponders[0];
		if (!firstGoodRecord.users) return null;
		return users.find((u) => u.id === firstGoodRecord.users!.id) ?? null;
	};

	const allOptions = await db
		.select()
		.from(pollOptionsTable)
		.where(eq(pollOptionsTable.poll_id, pollId))
		.orderBy(asc(pollOptionsTable.id));

	const usersById = new Map(users.map((u) => [u.id, u]));
	const votersByOptionId = result.reduce<Map<number, Set<string>>>(
		(acc, row) => {
			const optionId = row.polls_options?.id;
			const userId = row.users?.id;
			if (optionId === undefined || !userId) return acc;
			const existing = acc.get(optionId) ?? new Set<string>();
			existing.add(userId);
			acc.set(optionId, existing);
			return acc;
		},
		new Map()
	);

	const optionBreakdown: CommunityOptionBreakdown[] = allOptions.map((opt) => ({
		optionId: opt.id,
		optionText: opt.option,
		isCorrect: opt.correct,
		voters: [...(votersByOptionId.get(opt.id) ?? new Set<string>())].flatMap(
			(userId) => {
				const user = usersById.get(userId);
				return user ? [user] : [];
			}
		),
	}));

	return {
		totalResponses: users.length,
		users,
		firstToAnswer: users.length > 0 ? users[0] : null,
		fastestResponder,
		firstGood: firstGood(),
		playersInActiveRun,
		playersFallenOnDate,
		optionBreakdown,
	};
};

export const getRandomAnswerForDailyPoll = async (
	pollId: number,
	date: string
): Promise<RandomDailyAnswer | null> => {
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);
	const startOfNextDay = new Date(startOfDay);
	startOfNextDay.setDate(startOfNextDay.getDate() + 1);

	const [result] = await db
		.select({
			user: usersTable,
			selectedOptionId: pollResponseOptionsTable.option_id,
		})
		.from(pollResponsesTable)
		.where(
			and(
				eq(pollResponsesTable.poll_id, pollId),
				gte(pollResponsesTable.created_at, startOfDay),
				lt(pollResponsesTable.created_at, startOfNextDay)
			)
		)
		.leftJoin(usersTable, eq(pollResponsesTable.user_id, usersTable.id))
		.leftJoin(
			pollResponseOptionsTable,
			eq(pollResponsesTable.response_id, pollResponseOptionsTable.response_id)
		)
		.orderBy(sql`md5(${pollResponsesTable.user_id} || ${date})`)
		.limit(1);

	if (!result?.user || !result.selectedOptionId) return null;

	return {
		user: {
			id: result.user.id,
			email: result.user.email,
			displayName: result.user.display_name,
			photoUrl: result.user.photo_url,
		},
		selectedOptionId: result.selectedOptionId,
	};
};

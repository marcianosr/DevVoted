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

export type CommunityStats = {
	totalResponses: number;
	users: CommunityStatsUser[];
	firstToAnswer: CommunityStatsUser | null;
	fastestResponder: CommunityStatsUser | null;
	firstGood: CommunityStatsUser | null;
	playersInActiveRun: CommunityStatsUser[];
};

const emptyCommunityUser = (
	id: string,
	email: string,
	displayName: string,
	photoUrl: string | null
): CommunityStatsUser => ({
	id,
	email,
	displayName,
	photoUrl,
	answeredAt: null,
	timeTakenMs: null,
	responseData: { userId: null, createdAt: null, updatedAt: null },
});

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
		.selectDistinct({
			id: usersTable.id,
			email: usersTable.email,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
		})
		.from(runsTable)
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.where(eq(runsTable.status, "active"));

	const playersInActiveRun = activeRunPlayers.map((u) =>
		emptyCommunityUser(u.id, u.email, u.displayName, u.photoUrl)
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

	return {
		totalResponses: users.length,
		users,
		firstToAnswer: users.length > 0 ? users[0] : null,
		fastestResponder,
		firstGood: firstGood(),
		playersInActiveRun,
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

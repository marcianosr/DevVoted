import { eq, and, gte, lt, asc, sql, or, isNull, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "~/database/db";
import {
	pollHistoryTable,
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	pollsTable,
	runsTable,
	usersTable,
} from "~/database/schema";
import { evaluatePollAnswer } from "~/domains/polls/services/pollAnswerEvaluation.service";
import type { PipelineSlot } from "~/domains/runs/models/pipeline.model";
import {
	getActiveGate,
	getCurrentGate,
	getWindowSize,
} from "~/domains/runs/services/pipelineEvaluator.service";
import { isCategoryCode, type CategoryCode } from "~/domains/shared/categories";
import type { User } from "~/domains/users/services/userSync.service";

export type UserRole = "user" | "poll-editor" | "admin";

export type ActiveRunProgress = {
	pollsInWindow: number;
	windowSize: number;
	currentGate: number;
};

export type CommunityStatsUser = User & {
	equippedBorderId: string | null;
	role: UserRole;
	activeRunPipelineSlots: PipelineSlot[] | null;
	activeRunProgress: ActiveRunProgress | null;
	answeredAt: Date | null;
	timeTakenMs: number | null;
	responseData: {
		userId: string | null;
		createdAt: Date | null;
		updatedAt: Date | null;
	};
};

export type ActiveRunPlayer = User & {
	equippedBorderId: string | null;
	currentGate: number;
	pipelineSlots: PipelineSlot[];
	activeRunProgress: ActiveRunProgress;
};

export type FallenRunPlayer = User & {
	equippedBorderId: string | null;
	runId: number;
	currentGate: number;
	finishedAt: Date;
	completionReason: string | null;
	lootedBy: (User & { equippedBorderId: string | null }) | null;
	lootedAt: Date | null;
	lootAmount: number | null;
};

export type CommunityOptionBreakdown = {
	optionId: number;
	optionText: string;
	isCorrect: boolean;
	voters: CommunityStatsUser[];
};

export type MostPollsInCategoryAward = {
	user: CommunityStatsUser;
	count: number;
	categoryCode: CategoryCode;
};

export type MostCorrectInCategoryAward = {
	user: CommunityStatsUser;
	count: number;
	categoryCode: CategoryCode;
};

export type CommunityStats = {
	totalResponses: number;
	users: CommunityStatsUser[];
	firstToAnswer: CommunityStatsUser | null;
	fastestResponder: CommunityStatsUser | null;
	firstGood: CommunityStatsUser | null;
	mostPollsInCategory: MostPollsInCategoryAward | null;
	mostCorrectInCategory: MostCorrectInCategoryAward | null;
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
				equippedBorderId: r.users.equipped_border_id,
				role: r.users.role as UserRole,
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

	const usersDeduped = [
		...new Map(usersWithDuplicates.map((u) => [u.id, u])).values(),
	];

	// Enrich with each user's *active-run* pipeline + window progress. Users
	// without an active run get null — meaning the pipeline strip and progress
	// in the AvatarPopover are hidden.
	const userIds = usersDeduped.map((u) => u.id);
	const activeRunPipelines = userIds.length
		? await db
				.select({
					userId: runsTable.user_id,
					pipelineSlots: runsTable.pipeline_slots,
					pollsAnswered: sql<number>`COUNT(DISTINCT ${pollResponsesTable.poll_id})::int`,
				})
				.from(runsTable)
				.leftJoin(
					pollResponsesTable,
					eq(pollResponsesTable.run_id, runsTable.id)
				)
				.where(
					and(
						eq(runsTable.status, "active"),
						inArray(runsTable.user_id, userIds)
					)
				)
				.groupBy(runsTable.user_id, runsTable.id)
		: [];
	const progressByUserId = new Map(
		activeRunPipelines.map((r) => {
			const slots = r.pipelineSlots as PipelineSlot[];
			const windowSize = getWindowSize(slots);
			const pollsInWindow = r.pollsAnswered % windowSize;
			const currentGate = getActiveGate(r.pollsAnswered, slots);
			return [
				r.userId,
				{
					slots,
					progress: { pollsInWindow, windowSize, currentGate },
				},
			] as const;
		})
	);

	const users: CommunityStatsUser[] = usersDeduped.map((u) => {
		const entry = progressByUserId.get(u.id);
		return {
			...u,
			activeRunPipelineSlots: entry?.slots ?? null,
			activeRunProgress: entry?.progress ?? null,
		};
	});

	const activeRunPlayers = await db
		.select({
			id: usersTable.id,
			email: usersTable.email,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			equippedBorderId: usersTable.equipped_border_id,
			pipelineSlots: runsTable.pipeline_slots,
			pollsAnswered: sql<number>`COUNT(DISTINCT ${pollResponsesTable.poll_id})::int`,
		})
		.from(runsTable)
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.leftJoin(pollResponsesTable, eq(pollResponsesTable.run_id, runsTable.id))
		.where(eq(runsTable.status, "active"))
		.groupBy(usersTable.id, runsTable.id);

	const playersInActiveRun: ActiveRunPlayer[] = activeRunPlayers.map((row) => {
		const pipelineSlots = (row.pipelineSlots ?? []) as PipelineSlot[];
		const windowSize = getWindowSize(pipelineSlots);
		const currentGate = getActiveGate(row.pollsAnswered, pipelineSlots);
		const pollsInWindow = row.pollsAnswered % windowSize;
		return {
			id: row.id,
			email: row.email,
			displayName: row.displayName,
			photoUrl: row.photoUrl,
			equippedBorderId: row.equippedBorderId,
			currentGate,
			pipelineSlots,
			activeRunProgress: { pollsInWindow, windowSize, currentGate },
		};
	});

	const looterUsers = alias(usersTable, "looter_users");

	const fallenRunPlayers = await db
		.select({
			runId: runsTable.id,
			id: usersTable.id,
			email: usersTable.email,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			equippedBorderId: usersTable.equipped_border_id,
			pipelineSlots: runsTable.pipeline_slots,
			finishedAt: runsTable.finished_at,
			completionReason: runsTable.completion_reason,
			lootedAt: runsTable.looted_at,
			lootAmount: runsTable.loot_amount,
			looterId: looterUsers.id,
			looterEmail: looterUsers.email,
			looterDisplayName: looterUsers.display_name,
			looterPhotoUrl: looterUsers.photo_url,
			looterEquippedBorderId: looterUsers.equipped_border_id,
			pollsAnswered: sql<number>`COUNT(DISTINCT ${pollResponsesTable.poll_id})::int`,
		})
		.from(runsTable)
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.leftJoin(looterUsers, eq(runsTable.looted_by_user_id, looterUsers.id))
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
			runsTable.completion_reason,
			runsTable.looted_at,
			runsTable.loot_amount,
			looterUsers.id,
			looterUsers.email,
			looterUsers.display_name,
			looterUsers.photo_url,
			looterUsers.equipped_border_id
		);

	const playersFallenOnDate: FallenRunPlayer[] = fallenRunPlayers.flatMap(
		(row) => {
			if (!row.finishedAt) return [];
			const slots = row.pipelineSlots as PipelineSlot[];
			const currentGate = getCurrentGate(row.pollsAnswered, slots);
			const lootedBy = row.looterId
				? {
						id: row.looterId,
						email: row.looterEmail ?? "",
						displayName: row.looterDisplayName ?? "",
						photoUrl: row.looterPhotoUrl,
						equippedBorderId: row.looterEquippedBorderId,
					}
				: null;
			return [
				{
					runId: row.runId,
					id: row.id,
					email: row.email,
					displayName: row.displayName,
					photoUrl: row.photoUrl,
					equippedBorderId: row.equippedBorderId,
					currentGate,
					finishedAt: row.finishedAt,
					completionReason: row.completionReason,
					lootedBy,
					lootedAt: row.lootedAt,
					lootAmount: row.lootAmount,
				},
			];
		}
	);

	const [dailyPoll] = await db
		.select({ categoryCode: pollsTable.category_code })
		.from(pollsTable)
		.where(eq(pollsTable.id, pollId));

	const mostPollsInCategoryRows =
		dailyPoll && userIds.length
			? await db
					.select({
						userId: runsTable.user_id,
						count: sql<number>`COUNT(DISTINCT ${pollResponsesTable.poll_id})::int`,
					})
					.from(runsTable)
					.innerJoin(
						pollResponsesTable,
						eq(pollResponsesTable.run_id, runsTable.id)
					)
					.innerJoin(pollsTable, eq(pollResponsesTable.poll_id, pollsTable.id))
					.where(
						and(
							eq(runsTable.status, "active"),
							inArray(runsTable.user_id, userIds),
							eq(pollsTable.category_code, dailyPoll.categoryCode)
						)
					)
					.groupBy(runsTable.user_id)
					.orderBy(sql`count DESC`)
					.limit(1)
			: [];

	const usersById = new Map(users.map((u) => [u.id, u]));
	const topRow = mostPollsInCategoryRows[0];
	const topUser = topRow ? usersById.get(topRow.userId) : undefined;
	const mostPollsInCategory: MostPollsInCategoryAward | null =
		topRow && topUser && dailyPoll && isCategoryCode(dailyPoll.categoryCode)
			? {
					user: topUser,
					count: topRow.count,
					categoryCode: dailyPoll.categoryCode,
				}
			: null;

	// "Most correct in category": fetch each response's selected options vs. the
	// poll's full option set (filtered to active runs in today's category) and
	// reuse evaluatePollAnswer so the correctness rule stays in one place.
	const correctnessRows =
		dailyPoll && userIds.length
			? await db
					.select({
						userId: runsTable.user_id,
						responseId: pollResponsesTable.response_id,
						pollId: pollResponsesTable.poll_id,
						optionId: pollOptionsTable.id,
						optionCorrect: pollOptionsTable.correct,
						optionSelected: pollResponseOptionsTable.option_id,
					})
					.from(runsTable)
					.innerJoin(
						pollResponsesTable,
						eq(pollResponsesTable.run_id, runsTable.id)
					)
					.innerJoin(pollsTable, eq(pollsTable.id, pollResponsesTable.poll_id))
					.innerJoin(
						pollOptionsTable,
						eq(pollOptionsTable.poll_id, pollsTable.id)
					)
					.leftJoin(
						pollResponseOptionsTable,
						and(
							eq(
								pollResponseOptionsTable.response_id,
								pollResponsesTable.response_id
							),
							eq(pollResponseOptionsTable.option_id, pollOptionsTable.id)
						)
					)
					.where(
						and(
							eq(runsTable.status, "active"),
							inArray(runsTable.user_id, userIds),
							eq(pollsTable.category_code, dailyPoll.categoryCode)
						)
					)
			: [];

	type ResponseCounts = {
		userId: string;
		selectedCorrect: number;
		selectedIncorrect: number;
		totalCorrect: number;
	};
	const responseCountsById = new Map<number, ResponseCounts>();
	for (const row of correctnessRows) {
		const existing = responseCountsById.get(row.responseId) ?? {
			userId: row.userId,
			selectedCorrect: 0,
			selectedIncorrect: 0,
			totalCorrect: 0,
		};
		if (row.optionCorrect) existing.totalCorrect += 1;
		if (row.optionSelected !== null) {
			if (row.optionCorrect) existing.selectedCorrect += 1;
			else existing.selectedIncorrect += 1;
		}
		responseCountsById.set(row.responseId, existing);
	}

	const correctCountByUserId = new Map<string, number>();
	for (const counts of responseCountsById.values()) {
		if (!evaluatePollAnswer(counts).isFullyCorrect) continue;
		correctCountByUserId.set(
			counts.userId,
			(correctCountByUserId.get(counts.userId) ?? 0) + 1
		);
	}

	const topCorrectEntry = [...correctCountByUserId.entries()].reduce<
		[string, number] | null
	>(
		(best, entry) => (best === null || entry[1] > best[1] ? entry : best),
		null
	);
	const topCorrectUser = topCorrectEntry
		? usersById.get(topCorrectEntry[0])
		: undefined;
	const mostCorrectInCategory: MostCorrectInCategoryAward | null =
		topCorrectEntry &&
		topCorrectUser &&
		dailyPoll &&
		isCategoryCode(dailyPoll.categoryCode)
			? {
					user: topCorrectUser,
					count: topCorrectEntry[1],
					categoryCode: dailyPoll.categoryCode,
				}
			: null;

	const fastestResponder = users.reduce<CommunityStatsUser | null>(
		(fastest, user) => {
			if (user.timeTakenMs === null) return fastest;
			if (fastest === null || fastest.timeTakenMs === null) return user;
			return user.timeTakenMs < fastest.timeTakenMs ? user : fastest;
		},
		null
	);

	const allOptions = await db
		.select()
		.from(pollOptionsTable)
		.where(eq(pollOptionsTable.poll_id, pollId))
		.orderBy(asc(pollOptionsTable.id));

	const totalCorrect = allOptions.filter((o) => o.correct).length;

	const selectionsByUserId = result.reduce<
		Map<string, { correct: number; incorrect: number }>
	>((acc, row) => {
		const userId = row.users?.id;
		const option = row.polls_options;
		if (!userId || !option) return acc;
		const existing = acc.get(userId) ?? { correct: 0, incorrect: 0 };
		if (option.correct) existing.correct += 1;
		else existing.incorrect += 1;
		acc.set(userId, existing);
		return acc;
	}, new Map());

	const isFullyCorrect = (userId: string) => {
		const sel = selectionsByUserId.get(userId);
		if (!sel) return false;
		return evaluatePollAnswer({
			selectedCorrect: sel.correct,
			selectedIncorrect: sel.incorrect,
			totalCorrect,
		}).isFullyCorrect;
	};

	const firstGood = () => users.find((u) => isFullyCorrect(u.id)) ?? null;

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
		mostPollsInCategory,
		mostCorrectInCategory,
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

import {
	eq,
	and,
	gte,
	lt,
	sql,
	asc,
	desc,
	count,
	inArray,
	or,
	not,
	isNull,
} from "drizzle-orm";

import { db } from "~/database/db";
import {
	dailyPollsTable,
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	pollsTable,
	pollHistoryTable,
	usersTable,
} from "~/database/schema";
import { Poll, PollStatus, pollFactory } from "~/domains/polls/models/poll";
import type { PollCreator } from "~/domains/polls/models/pollCreator";
import { pollOptionFactory } from "~/domains/polls/models/pollOption";
import { pollResponseOptionFactory } from "~/domains/polls/models/pollResponseOption";
import {
	calculateCategoryWeights,
	type CategoryWeights,
} from "~/domains/polls/services/categoryWeight.service";
import { getAllActiveConfigIds } from "~/domains/runs/api/queries";
import {
	PollAnswerOutcome,
	outcomeMulti,
} from "~/domains/score/services/score.service";
import { User } from "~/domains/users/services/userSync.service";

export const fetchPollById = async (id: number): Promise<Poll | null> => {
	const pollRecord = await db
		.select()
		.from(pollsTable)
		.where(eq(pollsTable.id, id));

	if (!pollRecord.length) {
		throw new Error("Poll not found");
	}

	const poll = pollFactory.toDTO(pollRecord[0]);

	return poll;
};

export const fetchPollByIdWithOptions = async (id: number) => {
	// TODO: Improve with leftJoin if ever needed. Probably need to seperate the calls again
	const poll = await fetchPollById(id);

	if (!poll) {
		throw new Error("Poll not found");
	}
	const pollOptions = await db
		.select()
		.from(pollOptionsTable)
		.where(eq(pollOptionsTable.poll_id, id));

	const options = pollOptionFactory.toDTOs(pollOptions);

	return { poll, options };
};

export const fetchAllPolls = async () => {
	const pollRecords = await db
		.select()
		.from(pollsTable)
		.orderBy(pollsTable.created_at);

	// It follows REST API conventions where a GET on a collection returns an empty array, not an error, when no items exist
	return pollRecords.map((record) => pollFactory.toDTO(record));
};

export const fetchPollsByUser = async (userId: string) => {
	const pollRecords = await db
		.select()
		.from(pollsTable)
		.where(eq(pollsTable.created_by, userId))
		.orderBy(pollsTable.created_at);

	return pollRecords.map((record) => pollFactory.toDTO(record));
};

export const fetchPollCreators = async (): Promise<PollCreator[]> => {
	const creators = await db
		.select({
			id: usersTable.id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			githubUsername: usersTable.github_username,
			amountOfPolls: count().mapWith(Number),
		})
		.from(pollsTable)
		.innerJoin(usersTable, eq(pollsTable.created_by, usersTable.id))
		.groupBy(usersTable.id, usersTable.display_name)
		.orderBy(usersTable.display_name);

	return creators;
};

type CreatePollResponse = {
	pollId: number;
	userId: string;
	runId: number;
	answerDate: string; // "YYYY-MM-DD"
	selectedOptionIds: number[];
};
export const createPollResponse = async ({
	pollId,
	userId,
	runId,
	answerDate,
	selectedOptionIds,
}: CreatePollResponse) => {
	// Transaction instead of insert to ensure no orphaned records exist
	await db.transaction(async (tx) => {
		const [pollResponseRecord] = await tx
			.insert(pollResponsesTable)
			.values({
				poll_id: pollId,
				user_id: userId,
				run_id: runId,
				answer_date: answerDate,
			})
			.returning();

		if (!pollResponseRecord) throw new Error("Failed to create poll response");

		if (selectedOptionIds.length > 0) {
			const responseOptionRecords = pollResponseOptionFactory.fromDTOs(
				selectedOptionIds.map((optionId) => ({
					responseId: pollResponseRecord.response_id,
					optionId,
				}))
			);
			await tx.insert(pollResponseOptionsTable).values(responseOptionRecords);
		}
	});
};

export const hasUserAnsweredPoll = async (
	pollId: number,
	userId: string
): Promise<boolean> => {
	// Check if user answered this poll TODAY only
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const existingResponse = await db
		.select()
		.from(pollResponsesTable)
		.where(
			and(
				eq(pollResponsesTable.poll_id, pollId),
				eq(pollResponsesTable.user_id, userId),
				gte(pollResponsesTable.created_at, today)
			)
		);

	return existingResponse.length > 0;
};

export const getUserSelectedOptions = async (
	pollId: number,
	userId: string
): Promise<string[]> => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const response = await db
		.select({
			responseId: pollResponsesTable.response_id,
		})
		.from(pollResponsesTable)
		.where(
			and(
				eq(pollResponsesTable.poll_id, pollId),
				eq(pollResponsesTable.user_id, userId),
				gte(pollResponsesTable.created_at, today)
			)
		)
		.limit(1);

	if (response.length === 0) {
		return [];
	}

	const selectedOptions = await db
		.select({
			optionId: pollResponseOptionsTable.option_id,
		})
		.from(pollResponseOptionsTable)
		.where(eq(pollResponseOptionsTable.response_id, response[0].responseId));

	return selectedOptions.map((option) => String(option.optionId));
};

/**
 * Snapshot category weights for a future date (typically tomorrow).
 * Called at midnight to lock in weights based on current active configs.
 * Creates a daily_polls record with only the weights - poll_id stays null until first request.
 */
export const snapshotDailyWeights = async (
	date: string,
	weights: CategoryWeights
): Promise<void> => {
	await db
		.insert(dailyPollsTable)
		.values({
			date,
			poll_id: null,
			category_weights: weights,
		})
		.onConflictDoNothing(); // If record already exists, don't overwrite
};

/**
 * Get or create the daily poll for a specific date
 * Fast path: O(1) lookup if poll already exists for date
 * Slow path: Weighted seeded selection + update (first request of the day only)
 *
 * Uses category_weights from daily_polls if they were snapshotted at midnight.
 * Falls back to unweighted selection (equal probability) if no weights exist.
 */
export const getOrCreateDailyPoll = async (
	date: string,
	selectPollFn: (polls: Poll[]) => Poll | null,
	selectWeightedPollFn?: (
		polls: { id: number; categoryCode: string }[],
		weights: CategoryWeights
	) => { id: number; categoryCode: string } | null
): Promise<Poll | null> => {
	// Fast path: check if daily poll already exists AND has a selected poll
	const [existingDailyPoll] = await db
		.select()
		.from(dailyPollsTable)
		.where(eq(dailyPollsTable.date, date))
		.limit(1);

	if (existingDailyPoll?.poll_id) {
		const poll = await fetchPollById(existingDailyPoll.poll_id);
		return poll;
	}

	// Slow path: first request of the day - select poll and update record
	return await db.transaction(async (tx) => {
		// Double-check in transaction to prevent race conditions
		const [existingInTx] = await tx
			.select()
			.from(dailyPollsTable)
			.where(eq(dailyPollsTable.date, date))
			.limit(1);

		if (existingInTx?.poll_id) {
			const poll = await fetchPollById(existingInTx.poll_id);
			return poll;
		}

		// Get polls from the available pool with their category codes for weighted selection
		const pollRecords = await tx
			.select({ id: pollsTable.id, categoryCode: pollsTable.category_code })
			.from(pollsTable)
			.where(or(eq(pollsTable.status, "published")))
			.orderBy(pollsTable.id);

		if (pollRecords.length === 0) {
			return null;
		}

		let selectedPoll: { id: number; categoryCode: string } | null = null;

		// Use stored weights if they exist, otherwise calculate them on-the-fly
		let storedWeights =
			existingInTx?.category_weights as CategoryWeights | null;

		// If no weights were snapshotted, calculate them now based on active configs
		if (!storedWeights) {
			const allActiveConfigIds = await getAllActiveConfigIds();
			storedWeights = calculateCategoryWeights(allActiveConfigIds);
		}

		if (selectWeightedPollFn) {
			selectedPoll = selectWeightedPollFn(pollRecords, storedWeights);
		} else {
			// Fall back to unweighted selection
			const pollsForSelection = pollRecords.map((r) => ({ id: r.id }) as Poll);
			const result = selectPollFn(pollsForSelection);
			if (result) {
				const pollWithCategory = pollRecords.find((p) => p.id === result.id);
				if (pollWithCategory) {
					selectedPoll = pollWithCategory;
				}
			}
		}

		if (!selectedPoll) {
			return null;
		}

		// Insert or update daily_polls with selected poll and weights
		if (existingInTx) {
			// Update existing record - add poll_id and weights if missing
			await tx
				.update(dailyPollsTable)
				.set({
					poll_id: selectedPoll.id,
					category_weights: existingInTx.category_weights ?? storedWeights,
				})
				.where(eq(dailyPollsTable.date, date));
		} else {
			// Insert new record with poll_id and calculated weights
			await tx.insert(dailyPollsTable).values({
				date,
				poll_id: selectedPoll.id,
				category_weights: storedWeights,
			});
		}

		// Fetch the full poll
		const [fullPollRecord] = await tx
			.select()
			.from(pollsTable)
			.where(eq(pollsTable.id, selectedPoll.id));

		return pollFactory.toDTO(fullPollRecord);
	});
};

/**
 * Get poll history record for a specific run and poll
 */
export const getPollHistory = async (runId: number, pollId: number) => {
	const [record] = await db
		.select()
		.from(pollHistoryTable)
		.where(
			and(
				eq(pollHistoryTable.run_id, runId),
				eq(pollHistoryTable.poll_id, pollId)
			)
		);

	return record || null;
};

/**
 * Track when a user views a poll within a specific run
 * - First view: Creates new record with times_seen=1
 * - Subsequent views: Increments times_seen, updates last_seen_at
 */
export const trackPollView = async (
	runId: number,
	userId: string,
	pollId: number
): Promise<void> => {
	await db
		.insert(pollHistoryTable)
		.values({
			run_id: runId,
			user_id: userId,
			poll_id: pollId,
			times_seen: 1,
			times_answered: 0,
			first_seen_at: new Date(),
			last_seen_at: new Date(),
		})
		.onConflictDoUpdate({
			target: [pollHistoryTable.run_id, pollHistoryTable.poll_id],
			set: {
				times_seen: sql`${pollHistoryTable.times_seen} + 1`,
				last_seen_at: new Date(),
			},
		});
};

/**
 * Track when a user answers a poll within a specific run
 * - Increments times_answered counter
 * - Updates last_answered_at timestamp
 * - Creates record if user never viewed the poll (edge case)
 */
export const trackPollAnswer = async (
	runId: number,
	userId: string,
	pollId: number
): Promise<void> => {
	await db
		.insert(pollHistoryTable)
		.values({
			run_id: runId,
			user_id: userId,
			poll_id: pollId,
			times_seen: 1,
			times_answered: 1,
			first_seen_at: new Date(),
			last_seen_at: new Date(),
			last_answered_at: new Date(),
		})
		.onConflictDoUpdate({
			target: [pollHistoryTable.run_id, pollHistoryTable.poll_id],
			set: {
				times_answered: sql`${pollHistoryTable.times_answered} + 1`,
				last_answered_at: new Date(),
			},
		});
};

/**
 * Get total number of unique polls seen in a specific run
 * Each unique poll counts once (regardless of times_seen value)
 * Used for calculating current round and poll position in round
 */
export const getPollsSeenInRun = async (runId: number): Promise<number> => {
	const result = await db
		.select({
			count: sql<number>`COUNT(DISTINCT ${pollHistoryTable.poll_id})::int`,
		})
		.from(pollHistoryTable)
		.where(eq(pollHistoryTable.run_id, runId));

	return result[0]?.count ?? 0;
};

/**
 * Get total number of unique polls answered in a specific run.
 * Counts from pollResponsesTable, so the current poll's response is
 * included immediately after commitAnswerProgress writes it.
 * Used for pipeline window evaluation — "answered" polls, not just viewed.
 */
export const getAnsweredPollsCountInRun = async (
	runId: number
): Promise<number> => {
	const result = await db
		.select({
			count: sql<number>`COUNT(DISTINCT ${pollResponsesTable.poll_id})::int`,
		})
		.from(pollResponsesTable)
		.where(eq(pollResponsesTable.run_id, runId));

	return result[0]?.count ?? 0;
};

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

	// Deduplicate by user ID - Map keeps first occurrence (earliest due to ORDER BY)
	const users = [
		...new Map(usersWithDuplicates.map((u) => [u.id, u])).values(),
	];

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

	const getFirstGoodUser = firstGood();

	return {
		totalResponses: users.length,
		users,
		firstToAnswer: users.length > 0 ? users[0] : null,
		fastestResponder,
		firstGood: getFirstGoodUser,
	};
};

export type RandomDailyAnswer = {
	user: User;
	selectedOptionId: number;
};

/**
 * Get a single random user's answer for a daily poll.
 * Used for "telemetry-config" hints to show what others answered.
 */
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

export type RunPollHistory = {
	pollId: number;
	categoryCode: string;
	outcome: PollAnswerOutcome;
	answeredAt: Date | null;
};

/**
 * Get poll history for a run with correctness info.
 * Returns polls in the order they were first seen.
 *
 * Uses batch queries to avoid N+1 problem:
 * - Query 1: Poll history
 * - Query 2: User's response correctness (selected correct/incorrect counts)
 * - Query 3: Total correct options per poll
 * Then joins results in JS using Maps for O(1) lookup.
 */
export const getRunPollHistory = async (
	runId: number,
	userId: string
): Promise<RunPollHistory[]> => {
	// Query 1: Get poll history (must run first to get poll IDs for filtering)
	const historyResults = await db
		.select({
			pollId: pollHistoryTable.poll_id,
			categoryCode: pollsTable.category_code,
			answeredAt: pollHistoryTable.last_answered_at,
			timesAnswered: pollHistoryTable.times_answered,
		})
		.from(pollHistoryTable)
		.innerJoin(pollsTable, eq(pollHistoryTable.poll_id, pollsTable.id))
		.where(
			and(
				eq(pollHistoryTable.run_id, runId),
				eq(pollHistoryTable.user_id, userId)
			)
		)
		.orderBy(asc(pollHistoryTable.first_seen_at));

	// Early return if no polls in history
	if (historyResults.length === 0) {
		return [];
	}

	// Extract poll IDs for filtering subsequent queries
	const pollIds = historyResults.map((r) => r.pollId);

	// Run Query 2 and Query 3 in parallel, now filtered by poll IDs
	const [correctnessResults, totalCorrectResults] = await Promise.all([
		// Query 2: Get correctness data for LATEST response per poll
		// Uses subquery to find max response_id per poll for this user
		db
			.select({
				pollId: pollResponsesTable.poll_id,
				selectedCorrect: count(
					sql`CASE WHEN ${pollOptionsTable.correct} = true THEN 1 END`
				).mapWith(Number),
				selectedIncorrect: count(
					sql`CASE WHEN ${pollOptionsTable.correct} = false THEN 1 END`
				).mapWith(Number),
			})
			.from(pollResponsesTable)
			.innerJoin(
				pollResponseOptionsTable,
				eq(pollResponsesTable.response_id, pollResponseOptionsTable.response_id)
			)
			.innerJoin(
				pollOptionsTable,
				eq(pollResponseOptionsTable.option_id, pollOptionsTable.id)
			)
			.where(
				and(
					eq(pollResponsesTable.user_id, userId),
					inArray(pollResponsesTable.poll_id, pollIds),
					sql`${pollResponsesTable.response_id} = (
						SELECT MAX(pr2.response_id)
						FROM polls_responses pr2
						WHERE pr2.poll_id = ${pollResponsesTable.poll_id}
						AND pr2.user_id = ${userId}
					)`
				)
			)
			.groupBy(pollResponsesTable.poll_id),

		// Query 3: Get total correct options ONLY for polls in this run
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

	// Build Maps for O(1) lookup
	const correctnessMap = new Map(correctnessResults.map((r) => [r.pollId, r]));
	const totalCorrectMap = new Map(
		totalCorrectResults.map((r) => [r.pollId, r.totalCorrect])
	);

	// Join results in JS
	return historyResults.map((row) => {
		const correctness = correctnessMap.get(row.pollId);
		const totalCorrect = totalCorrectMap.get(row.pollId) ?? 0;

		const outcome: PollAnswerOutcome =
			row.timesAnswered === 0 || correctness === undefined
				? "wrong"
				: outcomeMulti(
						correctness.selectedCorrect,
						totalCorrect,
						correctness.selectedIncorrect
					);

		return {
			pollId: row.pollId,
			categoryCode: row.categoryCode,
			answeredAt: row.timesAnswered === 0 ? null : row.answeredAt,
			outcome,
		};
	});
};

// ============================================
// Poll CRUD Operations
// ============================================

type NewPollOption = {
	option: string;
	correct: boolean;
};

type UpdatePollOption = {
	id?: number; // Existing options have ID, new ones don't
	option: string;
	correct: boolean;
};

type NewPollData = {
	question: string;
	status: PollStatus;
	answerType: Poll["answerType"];
	createdBy: string;
	categoryCode: string;
	codeBlock?: string | null;
	codeSandboxExample?: string | null;
	explanation?: string | null;
};

/**
 * Create a poll with options in a single transaction
 */
export const createPollWithOptions = async (
	pollData: NewPollData,
	options: NewPollOption[]
) => {
	return await db.transaction(async (tx) => {
		// Get the next poll number
		const [maxResult] = await tx
			.select({ maxNum: sql<number>`COALESCE(MAX(poll_number), 0)` })
			.from(pollsTable);
		const nextPollNumber = (maxResult?.maxNum ?? 0) + 1;

		const [pollRecord] = await tx
			.insert(pollsTable)
			.values({
				question: pollData.question,
				status: pollData.status,
				answer_type: pollData.answerType,
				created_by: pollData.createdBy,
				category_code: pollData.categoryCode,
				code_block: pollData.codeBlock ?? null,
				code_sandbox_example: pollData.codeSandboxExample ?? null,
				explanation: pollData.explanation ?? null,
				opening_time: new Date(),
				closing_time: new Date(),
				poll_number: nextPollNumber,
			})
			.returning();

		if (!pollRecord) {
			throw new Error("Failed to create poll");
		}

		if (options.length > 0) {
			await tx.insert(pollOptionsTable).values(
				options.map((opt) => ({
					poll_id: pollRecord.id,
					option: opt.option,
					correct: opt.correct,
				}))
			);
		}

		return pollFactory.toDTO(pollRecord);
	});
};

/**
 * Update poll with options using upsert logic to preserve IDs
 * - Options with id: UPDATE existing row
 * - Options without id: INSERT new row
 * - Existing options not in list: DELETE
 */
export const updatePollWithOptions = async (
	pollId: number,
	pollData: Partial<NewPollData>,
	options: UpdatePollOption[]
) => {
	return await db.transaction(async (tx) => {
		// Update poll
		const updateValues: Record<string, unknown> = {};
		if (pollData.question !== undefined)
			updateValues.question = pollData.question;
		if (pollData.status !== undefined) updateValues.status = pollData.status;
		if (pollData.answerType !== undefined)
			updateValues.answer_type = pollData.answerType;
		if (pollData.categoryCode !== undefined)
			updateValues.category_code = pollData.categoryCode;
		if (pollData.codeBlock !== undefined)
			updateValues.code_block = pollData.codeBlock;
		if (pollData.codeSandboxExample !== undefined)
			updateValues.code_sandbox_example = pollData.codeSandboxExample;
		if (pollData.explanation !== undefined)
			updateValues.explanation = pollData.explanation;

		const [updatedPoll] = await tx
			.update(pollsTable)
			.set(updateValues)
			.where(eq(pollsTable.id, pollId))
			.returning();

		if (!updatedPoll) {
			throw new Error("Poll not found");
		}

		// Separate options into existing (with id) and new (without id)
		const existingOptions = options.filter((opt) => opt.id !== undefined);
		const newOptions = options.filter((opt) => opt.id === undefined);
		const incomingIds = existingOptions.map((opt) => opt.id as number);

		// Delete options that are no longer in the list
		if (incomingIds.length > 0) {
			await tx
				.delete(pollOptionsTable)
				.where(
					and(
						eq(pollOptionsTable.poll_id, pollId),
						not(inArray(pollOptionsTable.id, incomingIds))
					)
				);
		} else {
			// No existing options to keep, delete all
			await tx
				.delete(pollOptionsTable)
				.where(eq(pollOptionsTable.poll_id, pollId));
		}

		// Update existing options
		for (const opt of existingOptions) {
			await tx
				.update(pollOptionsTable)
				.set({ option: opt.option, correct: opt.correct })
				.where(eq(pollOptionsTable.id, opt.id as number));
		}

		// Insert new options
		if (newOptions.length > 0) {
			await tx.insert(pollOptionsTable).values(
				newOptions.map((opt) => ({
					poll_id: pollId,
					option: opt.option,
					correct: opt.correct,
				}))
			);
		}

		return pollFactory.toDTO(updatedPoll);
	});
};

export type WindowResult = {
	isCorrect: boolean; // selected all correct options and no incorrect ones
	isWrong: boolean; // selected at least one incorrect option
};

/**
 * Get correctness results for the last N poll responses in a run.
 * Used to build the PipelineEvaluationContext at window boundaries.
 *
 * Queries pollResponsesTable (written during commitAnswerProgress) so
 * the current poll's response is included even before trackPollAnswer runs.
 */
export const getWindowResults = async (
	runId: number,
	userId: string,
	windowSize: number
): Promise<WindowResult[]> => {
	const recentResponses = await db
		.select({
			responseId: pollResponsesTable.response_id,
			pollId: pollResponsesTable.poll_id,
		})
		.from(pollResponsesTable)
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

	return recentResponses.map(({ responseId, pollId }) => {
		const sel = selectednessMap.get(responseId);
		const totalCorrect = totalCorrectMap.get(pollId) ?? 0;

		if (!sel || totalCorrect === 0) return { isCorrect: false, isWrong: false };

		return {
			isCorrect:
				sel.selectedCorrect === totalCorrect && sel.selectedIncorrect === 0,
			isWrong: sel.selectedIncorrect > 0,
		};
	});
};

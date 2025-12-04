import { eq, and, gte, lt, sql, asc, count, inArray, or } from "drizzle-orm";

import { db } from "~/database/db";
import {
	dailyPollsTable,
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	pollsTable,
	pollHistoryTable,
} from "~/database/schema";
import { Poll, pollFactory } from "~/domains/polls/models/poll";
import { pollOptionFactory } from "~/domains/polls/models/pollOption";
import { pollResponseOptionFactory } from "~/domains/polls/models/pollResponseOption";

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

export const insertPoll = async (data: Poll) => {
	const pollRecord = pollFactory.fromDTO(data);
	const result = await db
		.insert(pollsTable)
		.values({
			question: pollRecord.question,
			status: pollRecord.status,
			answer_type: pollRecord.answer_type,
			opening_time: pollRecord.opening_time,
			closing_time: pollRecord.closing_time,
			created_by: pollRecord.created_by,
			created_at: pollRecord.created_at,
			updated_at: pollRecord.updated_at,
			category_code: pollRecord.category_code,
		})
		.returning();

	return result;
};

type CreatePollResponse = {
	pollId: number;
	userId: string;
	selectedOptionIds: number[];
};
export const createPollResponse = async ({
	pollId,
	userId,
	selectedOptionIds,
}: CreatePollResponse) => {
	// Transaction instead of insert to ensure no orphaned records exist
	await db.transaction(async (tx) => {
		const [pollResponseRecord] = await tx
			.insert(pollResponsesTable)
			.values({ poll_id: pollId, user_id: userId })
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
 * Get or create the daily poll for a specific date
 * Fast path: O(1) lookup if poll already exists for date
 * Slow path: Seeded selection + insert (first request of the day only)
 */
export const getOrCreateDailyPoll = async (
	date: string,
	selectPollFn: (polls: Poll[]) => Poll | null
): Promise<Poll | null> => {
	// Fast path: check if daily poll already exists for this date
	const [existingDailyPoll] = await db
		.select()
		.from(dailyPollsTable)
		.where(eq(dailyPollsTable.date, date))
		.limit(1);

	if (existingDailyPoll) {
		const poll = await fetchPollById(existingDailyPoll.poll_id);
		return poll;
	}

	// Slow path: first request of the day - select and insert
	return await db.transaction(async (tx) => {
		// Double-check in transaction to prevent race conditions
		const [existingInTx] = await tx
			.select()
			.from(dailyPollsTable)
			.where(eq(dailyPollsTable.date, date))
			.limit(1);

		if (existingInTx) {
			const poll = await fetchPollById(existingInTx.poll_id);
			return poll;
		}

		// Get poll IDs from the available pool (status = 'closed' or 'open')
		// Drafts and archived polls are excluded from daily selection
		// Include 'open' to match old behavior where open poll was closed first
		const pollRecords = await tx
			.select({ id: pollsTable.id })
			.from(pollsTable)
			.where(or(eq(pollsTable.status, "closed"), eq(pollsTable.status, "open")))
			.orderBy(pollsTable.id);

		if (pollRecords.length === 0) {
			return null;
		}

		// Create minimal Poll objects for selection (only need id for seeded random)
		const pollsForSelection = pollRecords.map((r) => ({ id: r.id }) as Poll);
		const selectedPoll = selectPollFn(pollsForSelection);

		if (!selectedPoll) {
			return null;
		}

		// Insert into daily_polls
		await tx.insert(dailyPollsTable).values({
			date,
			poll_id: selectedPoll.id,
		});

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

export const getCommunityStatsForDailyPoll = async (
	pollId: number,
	date: string
) => {
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);

	const startOfNextDay = new Date(startOfDay);
	startOfNextDay.setDate(startOfNextDay.getDate() + 1);

	const result = await db
		.select({ count: count() })
		.from(pollResponsesTable)
		.where(
			and(
				eq(pollResponsesTable.poll_id, pollId),
				gte(pollResponsesTable.created_at, startOfDay),
				lt(pollResponsesTable.created_at, startOfNextDay)
			)
		);

	return {
		totalResponses: result[0]?.count ?? 0,
	};
};

export type RunPollHistory = {
	pollId: number;
	categoryCode: string;
	isCorrect: boolean;
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
		// Query 2: Get correctness data filtered to run's polls
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
					inArray(pollResponsesTable.poll_id, pollIds)
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

		const isCorrect =
			row.timesAnswered > 0 &&
			correctness !== undefined &&
			correctness.selectedIncorrect === 0 &&
			correctness.selectedCorrect === totalCorrect;

		return {
			pollId: row.pollId,
			categoryCode: row.categoryCode,
			answeredAt: row.timesAnswered === 0 ? null : row.answeredAt,
			isCorrect,
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

type NewPollData = {
	question: string;
	status: "draft" | "open" | "closed" | "archived";
	answerType: "single" | "multiple";
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
 * Update a poll record
 */
export const updatePollById = async (
	id: number,
	data: Partial<NewPollData>
) => {
	const updateValues: Record<string, unknown> = {};

	if (data.question !== undefined) updateValues.question = data.question;
	if (data.status !== undefined) updateValues.status = data.status;
	if (data.answerType !== undefined) updateValues.answer_type = data.answerType;
	if (data.categoryCode !== undefined)
		updateValues.category_code = data.categoryCode;
	if (data.codeBlock !== undefined) updateValues.code_block = data.codeBlock;
	if (data.codeSandboxExample !== undefined)
		updateValues.code_sandbox_example = data.codeSandboxExample;
	if (data.explanation !== undefined)
		updateValues.explanation = data.explanation;

	const [updatedRecord] = await db
		.update(pollsTable)
		.set(updateValues)
		.where(eq(pollsTable.id, id))
		.returning();

	if (!updatedRecord) {
		throw new Error("Poll not found");
	}

	return pollFactory.toDTO(updatedRecord);
};

/**
 * Delete all options for a poll
 */
export const deletePollOptions = async (pollId: number) => {
	await db.delete(pollOptionsTable).where(eq(pollOptionsTable.poll_id, pollId));
};

/**
 * Insert poll options (bulk)
 */
export const insertPollOptions = async (
	pollId: number,
	options: NewPollOption[]
) => {
	if (options.length === 0) return [];

	const records = await db
		.insert(pollOptionsTable)
		.values(
			options.map((opt) => ({
				poll_id: pollId,
				option: opt.option,
				correct: opt.correct,
			}))
		)
		.returning();

	return pollOptionFactory.toDTOs(records);
};

/**
 * Update poll with options - replaces all options
 */
export const updatePollWithOptions = async (
	pollId: number,
	pollData: Partial<NewPollData>,
	options: NewPollOption[]
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

		const [updatedPoll] = await tx
			.update(pollsTable)
			.set(updateValues)
			.where(eq(pollsTable.id, pollId))
			.returning();

		if (!updatedPoll) {
			throw new Error("Poll not found");
		}

		// Delete existing options and insert new ones
		await tx
			.delete(pollOptionsTable)
			.where(eq(pollOptionsTable.poll_id, pollId));

		if (options.length > 0) {
			await tx.insert(pollOptionsTable).values(
				options.map((opt) => ({
					poll_id: pollId,
					option: opt.option,
					correct: opt.correct,
				}))
			);
		}

		return pollFactory.toDTO(updatedPoll);
	});
};

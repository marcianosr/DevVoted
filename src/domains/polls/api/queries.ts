import { eq, and, gte, sql } from "drizzle-orm";
import {
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	pollsTable,
	pollHistoryTable,
} from "~/database/schema";
import { Poll, pollFactory } from "~/domains/polls/models/poll";
import { db } from "~/database/db";
import { pollOptionFactory } from "~/domains/polls/models/pollOption";
import { pollResponseFactory } from "~/domains/polls/models/pollResponses";
import { pollResponseOptionFactory } from "~/domains/polls/models/pollResponseOption";
import { selectSeededRandom } from "~/lib/seededRandom";

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

// export const insertOptionsByPollId = async (data: {
// 	pollId: number;
// 	selectedOptions: string[];
// }) => {
// 	const optionsRecord = data.selectedOptions.map((option) => ({
// 		poll_id: data.pollId,
// 		option: option,
// 	}));
// 	const result = await db
// 		.insert(pollOptionsTable)
// 		.values(optionsRecord)
// 		.returning();

// 	return result;
// };

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

		if (!pollResponseRecord)
			throw new Error("Failed to create poll response");

		if (selectedOptionIds.length > 0) {
			const responseOptionRecords = pollResponseOptionFactory.fromDTOs(
				selectedOptionIds.map((optionId) => ({
					responseId: pollResponseRecord.response_id,
					optionId,
				}))
			);
			await tx
				.insert(pollResponseOptionsTable)
				.values(responseOptionRecords);
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

export const countUserPollAnswers = async (
	pollId: number,
	userId: string
): Promise<number> => {
	// Count total times user has answered this poll across all days
	const responses = await db
		.select()
		.from(pollResponsesTable)
		.where(
			and(
				eq(pollResponsesTable.poll_id, pollId),
				eq(pollResponsesTable.user_id, userId)
			)
		);

	return responses.length;
};

export const getUserPollStats = async (userId: string) => {
	// Get all user's poll responses grouped by poll_id
	const responses = await db
		.select({
			poll_id: pollResponsesTable.poll_id,
		})
		.from(pollResponsesTable)
		.where(eq(pollResponsesTable.user_id, userId));

	// Count responses per poll
	const pollStats = responses.reduce((acc, response) => {
		const pollId = response.poll_id;
		acc[pollId] = (acc[pollId] || 0) + 1;
		return acc;
	}, {} as Record<number, number>);

	return pollStats;
};

export const getAllPollsWithUserStats = async (userId: string) => {
	// Single query to get all polls with user stats, sorted by ID
	const result = await db
		.select({
			poll: pollsTable,
			timesAnswered: sql<number>`COUNT(${pollResponsesTable.response_id})::int`,
		})
		.from(pollsTable)
		.leftJoin(
			pollResponsesTable,
			and(
				eq(pollsTable.id, pollResponsesTable.poll_id),
				eq(pollResponsesTable.user_id, userId)
			)
		)
		.groupBy(pollsTable.id)
		.orderBy(pollsTable.id);

	return result.map(row => ({
		poll: pollFactory.toDTO(row.poll),
		hasAnswered: row.timesAnswered > 0,
		timesAnswered: row.timesAnswered,
	}));
};

export const openPoll = async (id: number) => {
	await db
		.update(pollsTable)
		.set({ status: "open" })
		.where(eq(pollsTable.id, id));
};

export const closePoll = async (id: number) => {
	await db
		.update(pollsTable)
		.set({ status: "closed" })
		.where(eq(pollsTable.id, id));
};

/**
 * Efficiently manage daily poll transitions - close all open polls, open today's poll
 * This prevents race conditions and ensures only one poll is open at a time
 */
export const manageDailyPollTransition = async (
	selectPollFn: (polls: Poll[]) => Poll | null
): Promise<Poll | null> => {
	return await db.transaction(async (tx) => {
		// First, close ALL open polls - simple and bulletproof
		await tx
			.update(pollsTable)
			.set({ status: "closed" })
			.where(eq(pollsTable.status, "open"));

		// Get all closed polls to select from
		const closedPollRecords = await tx
			.select()
			.from(pollsTable)
			.where(eq(pollsTable.status, "closed"))
			.orderBy(pollsTable.id);

		if (closedPollRecords.length === 0) {
			return null;
		}

		const closedPolls = pollFactory.toDTOs(closedPollRecords);
		const selectedPoll = selectPollFn(closedPolls);

		if (!selectedPoll) {
			return null;
		}

		// Open today's selected poll
		await tx
			.update(pollsTable)
			.set({ status: "open" })
			.where(eq(pollsTable.id, selectedPoll.id));

		return selectedPoll;
	});
};

/**
 * Get poll history record for a specific user and poll
 */
export const getPollHistory = async (
	userId: string,
	pollId: number
) => {
	const [record] = await db
		.select()
		.from(pollHistoryTable)
		.where(
			and(
				eq(pollHistoryTable.user_id, userId),
				eq(pollHistoryTable.poll_id, pollId)
			)
		);

	return record || null;
};

/**
 * Track when a user views a poll
 * - First view: Creates new record with times_seen=1
 * - Subsequent views: Increments times_seen, updates last_seen_at
 */
export const trackPollView = async (
	userId: string,
	pollId: number
): Promise<void> => {
	await db
		.insert(pollHistoryTable)
		.values({
			user_id: userId,
			poll_id: pollId,
			times_seen: 1,
			times_answered: 0,
			first_seen_at: new Date(),
			last_seen_at: new Date(),
		})
		.onConflictDoUpdate({
			target: [pollHistoryTable.user_id, pollHistoryTable.poll_id],
			set: {
				times_seen: sql`${pollHistoryTable.times_seen} + 1`,
				last_seen_at: new Date(),
			},
		});
};

/**
 * Track when a user answers a poll
 * - Increments times_answered counter
 * - Updates last_answered_at timestamp
 * - Creates record if user never viewed the poll (edge case)
 */
export const trackPollAnswer = async (
	userId: string,
	pollId: number
): Promise<void> => {
	await db
		.insert(pollHistoryTable)
		.values({
			user_id: userId,
			poll_id: pollId,
			times_seen: 1,
			times_answered: 1,
			first_seen_at: new Date(),
			last_seen_at: new Date(),
			last_answered_at: new Date(),
		})
		.onConflictDoUpdate({
			target: [pollHistoryTable.user_id, pollHistoryTable.poll_id],
			set: {
				times_answered: sql`${pollHistoryTable.times_answered} + 1`,
				last_answered_at: new Date(),
			},
		});
};

/**
 * Get total number of unique polls seen by a user across all time
 * Each unique poll counts once (regardless of times_seen value)
 * Used for calculating current round and poll position in round
 */
export const getTotalPollsSeenByUser = async (
	userId: string
): Promise<number> => {
	const result = await db
		.select({
			count: sql<number>`COUNT(DISTINCT ${pollHistoryTable.poll_id})::int`,
		})
		.from(pollHistoryTable)
		.where(eq(pollHistoryTable.user_id, userId));

	return result[0]?.count ?? 0;
};

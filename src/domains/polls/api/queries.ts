import { eq } from "drizzle-orm";
import {
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	pollsTable,
} from "~/database/schema";
import { Poll, pollFactory } from "~/domains/polls/models/poll";
import { db } from "~/database/db";
import { pollOptionFactory } from "~/domains/polls/models/pollOption";
import { pollResponseFactory } from "~/domains/polls/models/pollResponses";
import { pollResponseOptionFactory } from "~/domains/polls/models/pollResponseOptions";

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

/**
 * Creates a poll response for a user and links it to the selected options
 * @param pollId - The ID of the poll being responded to
 * @param userId - The ID of the user submitting the response (optional)
 * @param selectedOptionIds - Array of option IDs that the user selected
 * @returns The created poll response record and linked options
 */
export const createPollResponse = async ({
	pollId,
	userId,
	selectedOptionIds,
}: {
	pollId: number;
	userId?: string;
	selectedOptionIds: number[];
}) => {
	// First, create the poll response record
	const [pollResponseRecord] = await db
		.insert(pollResponsesTable)
		.values({
			poll_id: pollId,
			user_id: userId,
		})
		.returning();

	if (!pollResponseRecord) {
		throw new Error("Failed to create poll response");
	}

	// Convert the database record to a DTO
	const pollResponseDto = pollResponseFactory.toDTO(pollResponseRecord);

	// Only insert option links if there are options to insert
	if (selectedOptionIds.length > 0) {
		// Create DTOs for the response-option links
		const responseOptionDtos = selectedOptionIds.map((optionId) => ({
			responseId: pollResponseDto.responseId,
			optionId,
		}));

		// Convert DTOs to database records
		const responseOptionRecords =
			pollResponseOptionFactory.fromDTOs(responseOptionDtos);

		// Insert the records into the database
		await db.insert(pollResponseOptionsTable).values(responseOptionRecords);
	}

	return {
		response: pollResponseDto,
		selectedOptions: selectedOptionIds,
	};
};

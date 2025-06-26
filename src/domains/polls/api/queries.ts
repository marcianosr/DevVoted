import { eq } from "drizzle-orm";
import { pollOptionsTable, pollsTable } from "~/database/schema";
import { Poll, pollFactory } from "~/domains/polls/dto";
import { db } from "~/database/db";
import { pollOptionFactory } from "../pollOptionsDto";

export const fetchPollById = async (id: number): Promise<Poll> => {
	const polls = await db
		.select()
		.from(pollsTable)
		.where(eq(pollsTable.id, id));

	if (!polls.length) {
		throw new Error("Poll not found");
	}

	const poll = pollFactory.toDTO(polls[0]);

	return poll;
};

export const fetchPollByIdWithOptions = async (id: number) => {
	// TODO: Improve with leftJoin
	const polls = await db
		.select()
		.from(pollsTable)
		.where(eq(pollsTable.id, id));

	if (!polls.length) {
		throw new Error("Poll not found");
	}

	const pollOptions = await db
		.select()
		.from(pollOptionsTable)
		.where(eq(pollOptionsTable.poll_id, id));

	const poll = pollFactory.toDTO(polls[0]);

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

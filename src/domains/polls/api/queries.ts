import { eq } from "drizzle-orm";
import { pollsTable } from "~/database/schema";
import { Poll, pollFactory } from "@/src/domains/polls/api/schema";
import { db } from "~/database/db";

export const fetchPollById = async (id: number) => {
	const polls = await db
		.select()
		.from(pollsTable)
		.where(eq(pollsTable.id, id));

	const poll = pollFactory.toDTO(polls[0]);

	return poll;
};

export const fetchAllPolls = async () => {
	const pollRecords = await db
		.select()
		.from(pollsTable)
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

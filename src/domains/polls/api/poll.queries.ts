import { eq, and, not, inArray, sql, count } from "drizzle-orm";

import { db } from "~/database/db";
import { pollOptionsTable, pollsTable, usersTable } from "~/database/schema";
import { Poll, PollStatus, pollFactory } from "~/domains/polls/models/poll";
import type { PollCreator } from "~/domains/polls/models/pollCreator";
import { pollOptionFactory } from "~/domains/polls/models/pollOption";

export const fetchPollById = async (id: number): Promise<Poll | null> => {
	const pollRecord = await db
		.select()
		.from(pollsTable)
		.where(eq(pollsTable.id, id));

	if (!pollRecord.length) {
		throw new Error("Poll not found");
	}

	return pollFactory.toDTO(pollRecord[0]);
};

export const fetchPollByIdWithOptions = async (id: number) => {
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

// ─── Poll CRUD ────────────────────────────────────────────────────────────────

type NewPollOption = {
	option: string;
	correct: boolean;
};

type UpdatePollOption = {
	id?: number;
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

export const createPollWithOptions = async (
	pollData: NewPollData,
	options: NewPollOption[]
) => {
	return await db.transaction(async (tx) => {
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

export const updatePollWithOptions = async (
	pollId: number,
	pollData: Partial<NewPollData>,
	options: UpdatePollOption[]
) => {
	return await db.transaction(async (tx) => {
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

		const existingOptions = options.filter((opt) => opt.id !== undefined);
		const newOptions = options.filter((opt) => opt.id === undefined);
		const incomingIds = existingOptions.map((opt) => opt.id as number);

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
			await tx
				.delete(pollOptionsTable)
				.where(eq(pollOptionsTable.poll_id, pollId));
		}

		for (const opt of existingOptions) {
			await tx
				.update(pollOptionsTable)
				.set({ option: opt.option, correct: opt.correct })
				.where(eq(pollOptionsTable.id, opt.id as number));
		}

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

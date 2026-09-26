import { and, eq, inArray, not, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { pollOptionsTable, pollsTable } from "~/database/schema";
import type { Poll, PollStatus } from "~/modules/polls/poll/domain/poll.model";
import { toPoll } from "~/modules/polls/poll/infrastructure/poll.repository";

type NewPollOption = {
	option: string;
	correct: boolean;
};

type UpdatePollOption = NewPollOption & {
	id?: number;
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
): Promise<Poll> =>
	db.transaction(async (tx) => {
		const [maxResult] = await tx
			.select({ maxNum: sql<number>`COALESCE(MAX(poll_number), 0)` })
			.from(pollsTable);
		const nextPollNumber = (maxResult?.maxNum ?? 0) + 1;

		const [record] = await tx
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

		if (!record) {
			throw new Error("Failed to create poll");
		}

		if (options.length > 0) {
			await tx.insert(pollOptionsTable).values(
				options.map((option) => ({
					poll_id: record.id,
					option: option.option,
					correct: option.correct,
				}))
			);
		}

		return toPoll(record);
	});

type ExistingOption = NewPollOption & { id: number };

const isExistingOption = (option: UpdatePollOption): option is ExistingOption =>
	option.id !== undefined;

export const updatePollWithOptions = async (
	pollId: number,
	pollData: Partial<NewPollData>,
	options: UpdatePollOption[]
): Promise<Poll> =>
	db.transaction(async (tx) => {
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

		const [record] = await tx
			.update(pollsTable)
			.set(updateValues)
			.where(eq(pollsTable.id, pollId))
			.returning();

		if (!record) {
			throw new Error("Poll not found");
		}

		const existingOptions = options.filter(isExistingOption);
		const newOptions = options.filter((option) => option.id === undefined);
		const keptIds = existingOptions.map((option) => option.id);

		await tx
			.delete(pollOptionsTable)
			.where(
				keptIds.length > 0
					? and(
							eq(pollOptionsTable.poll_id, pollId),
							not(inArray(pollOptionsTable.id, keptIds))
						)
					: eq(pollOptionsTable.poll_id, pollId)
			);

		for (const option of existingOptions) {
			await tx
				.update(pollOptionsTable)
				.set({ option: option.option, correct: option.correct })
				.where(eq(pollOptionsTable.id, option.id));
		}

		if (newOptions.length > 0) {
			await tx.insert(pollOptionsTable).values(
				newOptions.map((option) => ({
					poll_id: pollId,
					option: option.option,
					correct: option.correct,
				}))
			);
		}

		return toPoll(record);
	});

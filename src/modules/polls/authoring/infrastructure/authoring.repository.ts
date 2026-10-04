import { and, eq, inArray, isNull, not, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { pollOptionsTable, pollsTable, usersTable } from "~/database/schema";
import {
	APPROVED_POLL_ARCHIVE_KB,
	type Poll,
	type PollStatus,
} from "~/modules/polls/poll/domain/poll.model";
import { toPoll } from "~/modules/polls/poll/infrastructure/poll.repository";
import { STORAGE_UNITS } from "~/shared/lib/storage";

type Updater = Pick<typeof db, "update">;

const APPROVED_POLL_ARCHIVE_BYTES = APPROVED_POLL_ARCHIVE_KB * STORAGE_UNITS.KB;

type NewPollOption = {
	option: string;
	correct: boolean;
};

type UpdatePollOption = NewPollOption & {
	id?: number;
};

type PollContent = {
	question: string;
	status: PollStatus;
	answerType: Poll["answerType"];
	categoryCode: string;
	codeBlock?: string | null;
	codeSandboxExample?: string | null;
	explanation?: string | null;
};

type NewPoll = PollContent & { createdBy: string };

type PollColumns<Content extends Partial<PollContent>> = {
	question: Content["question"];
	status: Content["status"];
	answer_type: Content["answerType"];
	category_code: Content["categoryCode"];
	code_block: Content["codeBlock"];
	code_sandbox_example: Content["codeSandboxExample"];
	explanation: Content["explanation"];
};

const pollColumnsOf = <Content extends Partial<PollContent>>(
	content: Content
): PollColumns<Content> => ({
	question: content.question,
	status: content.status,
	answer_type: content.answerType,
	category_code: content.categoryCode,
	code_block: content.codeBlock,
	code_sandbox_example: content.codeSandboxExample,
	explanation: content.explanation,
});

export const createPollWithOptions = async (
	poll: NewPoll,
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
				...pollColumnsOf(poll),
				created_by: poll.createdBy,
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
	content: Partial<PollContent>,
	options: UpdatePollOption[]
): Promise<Poll> =>
	db.transaction(async (tx) => {
		const [record] = await tx
			.update(pollsTable)
			.set(pollColumnsOf(content))
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
				.where(
					and(
						eq(pollOptionsTable.id, option.id),
						eq(pollOptionsTable.poll_id, pollId)
					)
				);
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

		await payAuthorOnFirstPublish(tx, pollId);

		return toPoll(record);
	});

export const payAuthorOnFirstPublish = async (
	tx: Updater,
	pollId: number
): Promise<string | null> => {
	const [paid] = await tx
		.update(pollsTable)
		.set({ author_paid_at: new Date() })
		.where(
			and(
				eq(pollsTable.id, pollId),
				eq(pollsTable.status, "published"),
				isNull(pollsTable.author_paid_at)
			)
		)
		.returning({ author: pollsTable.created_by });

	if (!paid) return null;

	await tx
		.update(usersTable)
		.set({
			archived_storage: sql`${usersTable.archived_storage} + ${APPROVED_POLL_ARCHIVE_BYTES}`,
		})
		.where(eq(usersTable.id, paid.author));

	return paid.author;
};

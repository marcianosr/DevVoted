import { and, eq, inArray, isNull, not, notInArray, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { pollOptionsTable, pollsTable, usersTable } from "~/database/schema";
import type { Poll, PollStatus } from "~/modules/polls/poll/domain/poll.model";
import type { PublishedCounts } from "~/modules/polls/poll/domain/pollBounty.model";
import { toPoll } from "~/modules/polls/poll/infrastructure/poll.repository";
import { isCategoryCode } from "~/shared/lib/categories";
import { STORAGE_UNITS } from "~/shared/lib/storage";
import { ADMIN_EMAILS } from "~/shared/utils/adminAuth";

type Updater = Pick<typeof db, "update">;

const UNEDITED = { updated_at: sql`${pollsTable.updated_at}` };

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

type NewPoll = PollContent & { createdBy: string; authorRewardKb: number };

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
				author_reward_kb: poll.authorRewardKb,
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

export const markPollReviewed = async (
	pollId: number,
	reviewedAt: Date
): Promise<Poll> => {
	const [record] = await db
		.update(pollsTable)
		.set({ reviewed_at: reviewedAt, ...UNEDITED })
		.where(eq(pollsTable.id, pollId))
		.returning();

	if (!record) {
		throw new Error("Poll not found");
	}

	return toPoll(record);
};

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
		.set({ author_paid_at: new Date(), ...UNEDITED })
		.where(
			and(
				eq(pollsTable.id, pollId),
				eq(pollsTable.status, "published"),
				isNull(pollsTable.author_paid_at)
			)
		)
		.returning({
			author: pollsTable.created_by,
			rewardKb: pollsTable.author_reward_kb,
		});

	if (!paid) return null;

	const [credited] = await tx
		.update(usersTable)
		.set({
			archived_storage: sql`${usersTable.archived_storage} + ${paid.rewardKb * STORAGE_UNITS.KB}`,
		})
		.where(
			and(
				eq(usersTable.id, paid.author),
				notInArray(usersTable.email, [...ADMIN_EMAILS])
			)
		)
		.returning({ id: usersTable.id });

	return credited?.id ?? null;
};

export type AnnouncedPoll = { id: number; question: string; rewardKb: number };

export const fetchUnannouncedPublishedPolls = async (
	userId: string
): Promise<readonly AnnouncedPoll[]> =>
	db
		.select({
			id: pollsTable.id,
			question: pollsTable.question,
			rewardKb: pollsTable.author_reward_kb,
		})
		.from(pollsTable)
		.where(
			and(
				eq(pollsTable.created_by, userId),
				not(isNull(pollsTable.author_paid_at)),
				isNull(pollsTable.author_announced_at)
			)
		)
		.orderBy(pollsTable.author_paid_at);

export const markPollsAnnounced = async (
	userId: string,
	pollIds: readonly number[]
): Promise<void> => {
	if (pollIds.length === 0) return;

	await db
		.update(pollsTable)
		.set({ author_announced_at: new Date(), ...UNEDITED })
		.where(
			and(
				eq(pollsTable.created_by, userId),
				inArray(pollsTable.id, [...pollIds]),
				isNull(pollsTable.author_announced_at)
			)
		);
};

export const fetchPublishedCounts = async (): Promise<PublishedCounts> => {
	const rows = await db
		.select({
			code: pollsTable.category_code,
			published: sql<number>`count(*)::int`,
		})
		.from(pollsTable)
		.where(eq(pollsTable.status, "published"))
		.groupBy(pollsTable.category_code);

	return Object.fromEntries(
		rows.flatMap(({ code, published }) =>
			isCategoryCode(code) ? [[code, published]] : []
		)
	);
};

export const fetchPublishedCountIn = async (
	categoryCode: string
): Promise<number> => {
	const [row] = await db
		.select({ published: sql<number>`count(*)::int` })
		.from(pollsTable)
		.where(
			and(
				eq(pollsTable.status, "published"),
				eq(pollsTable.category_code, categoryCode)
			)
		);

	return row?.published ?? 0;
};

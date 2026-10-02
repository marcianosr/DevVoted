import { count, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { db } from "~/database/db";
import { pollOptionsTable, pollsTable, usersTable } from "~/database/schema";
import type { Poll, PollCreator } from "~/modules/polls/poll/domain/poll.model";
import type { PollScope } from "~/modules/polls/poll/domain/pollAccess.model";
import type { PollOption } from "~/modules/polls/poll/domain/pollOption.model";
import type { CategoryCode } from "~/shared/lib/categories";

type PollRecord = InferSelectModel<typeof pollsTable>;
type PollOptionRecord = InferSelectModel<typeof pollOptionsTable>;

export const toPoll = (record: PollRecord): Poll => ({
	id: record.id,
	question: record.question,
	status: record.status,
	answerType: record.answer_type,
	openingTime: record.opening_time,
	closingTime: record.closing_time,
	createdBy: record.created_by,
	createdAt: record.created_at || new Date(),
	updatedAt: record.updated_at,
	categoryCode: record.category_code as CategoryCode,
	codeSandboxExample: record.code_sandbox_example,
	codeBlock: record.code_block,
	explanation: record.explanation,
	pollNumber: record.poll_number,
});

const toPollOption = (record: PollOptionRecord): PollOption => ({
	id: record.id,
	pollId: record.poll_id,
	option: record.option,
	correct: record.correct,
});

export const fetchPollById = async (id: number): Promise<Poll> => {
	const [record] = await db
		.select()
		.from(pollsTable)
		.where(eq(pollsTable.id, id));

	if (!record) {
		throw new Error("Poll not found");
	}

	return toPoll(record);
};

export const fetchPollByIdWithOptions = async (
	id: number
): Promise<{ poll: Poll; options: PollOption[] }> => {
	const poll = await fetchPollById(id);

	const records = await db
		.select()
		.from(pollOptionsTable)
		.where(eq(pollOptionsTable.poll_id, id));

	return { poll, options: records.map(toPollOption) };
};

const scopeFilterOf = (scope: PollScope) =>
	scope.kind === "every"
		? undefined
		: eq(pollsTable.created_by, scope.authorId);

export const fetchPollsIn = async (scope: PollScope): Promise<Poll[]> => {
	const records = await db
		.select()
		.from(pollsTable)
		.where(scopeFilterOf(scope))
		.orderBy(pollsTable.created_at);

	return records.map(toPoll);
};

export const countPublishedPolls = async (): Promise<number> => {
	const [result] = await db
		.select({ total: count() })
		.from(pollsTable)
		.where(eq(pollsTable.status, "published"));

	return result?.total ?? 0;
};

export const fetchPollCreators = async (): Promise<PollCreator[]> =>
	db
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

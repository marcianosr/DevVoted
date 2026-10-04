import { and, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { pollResponsesTable } from "~/database/schema";
import type { PollStats } from "~/modules/run/run/domain/pollStats.model";

import type { DbReader } from "~/modules/run/run/infrastructure/runPolls.repository";

const isoOf = (value: Date | string | null | undefined): string | undefined =>
	value === null || value === undefined
		? undefined
		: new Date(value).toISOString();

export const fetchPollStats = async (
	pollId: number,
	userId: string,
	reader: DbReader = db
): Promise<PollStats> => {
	const honest = and(
		eq(pollResponsesTable.poll_id, pollId),
		eq(pollResponsesTable.mirrored, false)
	);

	const firstAttempts = reader
		.select({
			outcome: pollResponsesTable.outcome,
			rank: sql<number>`row_number() over (partition by ${pollResponsesTable.user_id} order by ${pollResponsesTable.created_at})`.as(
				"rank"
			),
		})
		.from(pollResponsesTable)
		.where(and(honest, isNotNull(pollResponsesTable.user_id)))
		.as("first_attempts");

	const [room, mine] = await Promise.all([
		reader
			.select({
				attempts: sql<string>`count(*)`,
				right: sql<string>`count(*) filter (where ${firstAttempts.outcome} = 'correct')`,
			})
			.from(firstAttempts)
			.where(eq(firstAttempts.rank, 1)),
		reader
			.select({
				attempts: sql<string>`count(*)`,
				misses: sql<string>`count(*) filter (where ${pollResponsesTable.outcome} is distinct from 'correct')`,
				lastAnsweredAt: sql<
					Date | string | null
				>`max(${pollResponsesTable.created_at})`,
			})
			.from(pollResponsesTable)
			.where(and(honest, eq(pollResponsesTable.user_id, userId))),
	]);

	return {
		firstAttempts: Number(room[0]?.attempts ?? 0),
		firstAttemptsRight: Number(room[0]?.right ?? 0),
		attempts: Number(mine[0]?.attempts ?? 0),
		misses: Number(mine[0]?.misses ?? 0),
		lastAnsweredAt: isoOf(mine[0]?.lastAnsweredAt),
	};
};

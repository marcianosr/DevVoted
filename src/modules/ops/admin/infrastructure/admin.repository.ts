import { and, count, desc, eq, lt, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	dailyPollsTable,
	pollResponsesTable,
	pollsTable,
	runsTable,
	usersTable,
} from "~/database/schema";

const RECENT_RESPONSES = 20;

export type AdminPollRow = {
	readonly id: number;
	readonly question: string;
	readonly categoryCode: string;
	readonly openingTime: Date;
	readonly closingTime: Date;
};

export type AdminPastPollRow = {
	readonly pollId: number;
	readonly question: string;
	readonly categoryCode: string;
	readonly occurrences: number;
	readonly lastDate: string;
	readonly allDates: readonly string[];
};

export type AdminResponseRow = {
	readonly responseId: number;
	readonly pollId: number;
	readonly question: string;
	readonly createdAt: Date | null;
	readonly displayName: string | null;
	readonly email: string | null;
};

export type AdminUserRow = {
	readonly id: string;
	readonly displayName: string;
	readonly email: string;
	readonly pollsSubmitted: number;
	readonly runId: number | null;
};

export const fetchTodaysDailyPolls = async (
	today: string
): Promise<AdminPollRow[]> =>
	db
		.select({
			id: pollsTable.id,
			question: pollsTable.question,
			categoryCode: pollsTable.category_code,
			openingTime: pollsTable.opening_time,
			closingTime: pollsTable.closing_time,
		})
		.from(dailyPollsTable)
		.innerJoin(pollsTable, eq(dailyPollsTable.poll_id, pollsTable.id))
		.where(eq(dailyPollsTable.date, today))
		.orderBy(desc(dailyPollsTable.created_at));

export const fetchPastDailyPolls = async (
	today: string
): Promise<AdminPastPollRow[]> =>
	db
		.select({
			pollId: pollsTable.id,
			question: pollsTable.question,
			categoryCode: pollsTable.category_code,
			occurrences: count(dailyPollsTable.id),
			lastDate: sql<string>`max(${dailyPollsTable.date})`,
			allDates: sql<
				string[]
			>`array_agg(${dailyPollsTable.date} order by ${dailyPollsTable.date} desc)`,
		})
		.from(dailyPollsTable)
		.innerJoin(pollsTable, eq(dailyPollsTable.poll_id, pollsTable.id))
		.where(lt(dailyPollsTable.date, today))
		.groupBy(pollsTable.id, pollsTable.question, pollsTable.category_code)
		.orderBy(desc(sql`max(${dailyPollsTable.date})`));

export const fetchRecentResponses = async (): Promise<AdminResponseRow[]> =>
	db
		.select({
			responseId: pollResponsesTable.response_id,
			pollId: pollResponsesTable.poll_id,
			question: pollsTable.question,
			createdAt: pollResponsesTable.created_at,
			displayName: usersTable.display_name,
			email: usersTable.email,
		})
		.from(pollResponsesTable)
		.innerJoin(pollsTable, eq(pollResponsesTable.poll_id, pollsTable.id))
		.leftJoin(usersTable, eq(pollResponsesTable.user_id, usersTable.id))
		.orderBy(desc(pollResponsesTable.created_at))
		.limit(RECENT_RESPONSES);

export const fetchUsersWithActiveRun = async (): Promise<AdminUserRow[]> =>
	db
		.select({
			id: usersTable.id,
			displayName: usersTable.display_name,
			email: usersTable.email,
			pollsSubmitted: usersTable.total_polls_submitted,
			runId: runsTable.id,
		})
		.from(usersTable)
		.leftJoin(
			runsTable,
			and(eq(runsTable.user_id, usersTable.id), eq(runsTable.status, "active"))
		)
		.orderBy(desc(usersTable.total_polls_submitted));

export const countActiveRuns = async (): Promise<number> => {
	const [row] = await db
		.select({ active: count() })
		.from(runsTable)
		.where(eq(runsTable.status, "active"));

	return row?.active ?? 0;
};

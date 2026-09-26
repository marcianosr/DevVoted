import { and, asc, desc, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { pollResponsesTable, pollsTable, usersTable } from "~/database/schema";
import { findBorderById } from "~/modules/account/profile/domain/border.model";
import { type CategoryCode, isCategoryCode } from "~/shared/lib/categories";

import type {
	CategoryLeader,
	CategorySeat,
} from "~/modules/run/run/domain/categoryLeader.model";
import { isLeadingStreak } from "~/modules/run/run/domain/categoryLeader.model";
import type { DbReader } from "~/modules/run/run/infrastructure/runPolls.repository";

type Scope = {
	readonly category?: CategoryCode;
	readonly onlyUserId?: string;
};

const islandsIn = (reader: DbReader, scope: Scope) => {
	const answers = reader
		.select({
			userId: pollResponsesTable.user_id,
			categoryCode: pollsTable.category_code,
			outcome: pollResponsesTable.outcome,
			broken:
				sql<number>`count(*) filter (where ${pollResponsesTable.outcome} = 'wrong') over (partition by ${pollResponsesTable.user_id}, ${pollsTable.category_code} order by ${pollResponsesTable.created_at}, ${pollResponsesTable.response_id} rows unbounded preceding)`.as(
					"broken"
				),
		})
		.from(pollResponsesTable)
		.innerJoin(pollsTable, eq(pollsTable.id, pollResponsesTable.poll_id))
		.where(
			and(
				eq(pollResponsesTable.mirrored, false),
				isNotNull(pollResponsesTable.user_id),
				isNotNull(pollResponsesTable.outcome),
				scope.category === undefined
					? undefined
					: eq(pollsTable.category_code, scope.category),
				scope.onlyUserId === undefined
					? undefined
					: eq(pollResponsesTable.user_id, scope.onlyUserId)
			)
		)
		.as("answers");

	return reader
		.select({
			userId: answers.userId,
			categoryCode: answers.categoryCode,
			streak:
				sql<string>`count(*) filter (where ${answers.outcome} = 'correct')`.as(
					"streak"
				),
		})
		.from(answers)
		.groupBy(answers.userId, answers.categoryCode, answers.broken)
		.as("islands");
};

const bestsIn = (reader: DbReader, scope: Scope) => {
	const islands = islandsIn(reader, scope);

	return reader
		.select({
			userId: islands.userId,
			categoryCode: islands.categoryCode,
			best: sql<string>`max(${islands.streak})`.as("best"),
		})
		.from(islands)
		.groupBy(islands.userId, islands.categoryCode)
		.as("bests");
};

const LEADER_COLUMNS = {
	handle: usersTable.github_username,
	displayName: usersTable.display_name,
	photoUrl: usersTable.photo_url,
	borderId: usersTable.equipped_border_id,
};

type LeaderRow = {
	userId: string | null;
	best: string | number | null;
	handle: string | null;
	displayName: string | null;
	photoUrl: string | null;
	borderId: string | null;
};

const countOf = (value: string | number | null | undefined): number =>
	value === null || value === undefined ? 0 : Number(value);

const leaderOf = (
	row: LeaderRow | undefined,
	userId: string
): CategoryLeader | undefined => {
	if (row === undefined) return undefined;

	if (row.userId === null) return undefined;

	const streak = countOf(row.best);
	if (!isLeadingStreak(streak)) return undefined;

	const handle = row.handle === null ? row.displayName : `@${row.handle}`;
	if (handle === null) return undefined;

	const borderUrl =
		row.borderId === null ? undefined : findBorderById(row.borderId)?.image;

	return {
		userId: row.userId,
		handle,
		streak,
		you: row.userId === userId,
		...(row.photoUrl === null ? {} : { avatarUrl: row.photoUrl }),
		...(borderUrl === undefined ? {} : { borderUrl }),
		...(row.handle === null ? {} : { githubLogin: row.handle }),
	};
};

export const fetchCategoryLeader = async (
	category: CategoryCode,
	userId: string,
	reader: DbReader = db
): Promise<CategorySeat> => {
	const bests = bestsIn(reader, { category });

	const rows = await reader
		.select({ userId: bests.userId, best: bests.best, ...LEADER_COLUMNS })
		.from(bests)
		.innerJoin(usersTable, eq(usersTable.id, bests.userId))
		.orderBy(desc(bests.best), asc(bests.userId))
		.limit(1);

	const leader = leaderOf(rows[0], userId);

	return { category, ...(leader === undefined ? {} : { leader }) };
};

export const fetchCategoryLeaders = async (
	userId: string,
	reader: DbReader = db
): Promise<CategorySeat[]> => {
	const bests = bestsIn(reader, {});

	const ranked = reader
		.select({
			categoryCode: bests.categoryCode,
			userId: bests.userId,
			best: bests.best,
			...LEADER_COLUMNS,
			rank: sql<number>`row_number() over (partition by ${bests.categoryCode} order by ${bests.best} desc, ${bests.userId} asc)`.as(
				"rank"
			),
		})
		.from(bests)
		.innerJoin(usersTable, eq(usersTable.id, bests.userId))
		.as("ranked");

	const rows = await reader
		.select({
			categoryCode: ranked.categoryCode,
			userId: ranked.userId,
			best: ranked.best,
			handle: ranked.handle,
			displayName: ranked.displayName,
			photoUrl: ranked.photoUrl,
			borderId: ranked.borderId,
		})
		.from(ranked)
		.where(eq(ranked.rank, 1));

	return rows.flatMap((row): CategorySeat[] => {
		const leader = leaderOf(row, userId);
		if (leader === undefined || !isCategoryCode(row.categoryCode)) return [];

		return [{ category: row.categoryCode, leader }];
	});
};

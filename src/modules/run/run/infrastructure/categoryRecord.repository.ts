import { and, asc, desc, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { pollResponsesTable, pollsTable, usersTable } from "~/database/schema";
import { findBorderById } from "~/domains/economy/data/borders";
import type { CategoryCode } from "~/shared/lib/categories";

import type {
	CategoryRecord,
	CategoryRecordHolder,
} from "~/modules/run/run/domain/categoryRecord.model";
import { isRecordStreak } from "~/modules/run/run/domain/categoryRecord.model";
import type { DbReader } from "~/modules/run/run/infrastructure/runPolls.repository";

/**
 * Every honest answer in one category, each row carrying how many runs had
 * already been broken before it.
 *
 * That running count of `wrong` answers is the island key: rows sharing one
 * count sat between the same two breaks, so grouping by it groups by unbroken
 * run. A `partial` increments nothing and is counted as nothing, which is
 * exactly `nextStreak`'s rule — it neither extends a run nor ends one.
 *
 * Three filters, three different reasons to be wrong without them:
 * `mirrored` rows graded the inverted question (ADR-038), so they would
 * fabricate and destroy runs arbitrarily; a null `user_id` is a deleted
 * account, and every one of them would collapse into a single phantom player;
 * a null `outcome` is a row the backfill never reached, which is unknown, not
 * a break.
 */
const islandsIn = (
	reader: DbReader,
	category: CategoryCode,
	onlyUserId?: string
) => {
	const answers = reader
		.select({
			userId: pollResponsesTable.user_id,
			outcome: pollResponsesTable.outcome,
			broken:
				sql<number>`count(*) filter (where ${pollResponsesTable.outcome} = 'wrong') over (partition by ${pollResponsesTable.user_id} order by ${pollResponsesTable.created_at}, ${pollResponsesTable.response_id} rows unbounded preceding)`.as(
					"broken"
				),
		})
		.from(pollResponsesTable)
		.innerJoin(pollsTable, eq(pollsTable.id, pollResponsesTable.poll_id))
		.where(
			and(
				eq(pollsTable.category_code, category),
				eq(pollResponsesTable.mirrored, false),
				isNotNull(pollResponsesTable.user_id),
				isNotNull(pollResponsesTable.outcome),
				onlyUserId === undefined
					? undefined
					: eq(pollResponsesTable.user_id, onlyUserId)
			)
		)
		.as("answers");

	return reader
		.select({
			userId: answers.userId,
			streak:
				sql<string>`count(*) filter (where ${answers.outcome} = 'correct')`.as(
					"streak"
				),
		})
		.from(answers)
		.groupBy(answers.userId, answers.broken)
		.as("islands");
};

/** The longest island each player has, one row per player. */
const bestsIn = (
	reader: DbReader,
	category: CategoryCode,
	onlyUserId?: string
) => {
	const islands = islandsIn(reader, category, onlyUserId);

	return reader
		.select({
			userId: islands.userId,
			best: sql<string>`max(${islands.streak})`.as("best"),
		})
		.from(islands)
		.groupBy(islands.userId)
		.as("bests");
};

type HolderRow = {
	userId: string | null;
	best: string | number | null;
	handle: string | null;
	displayName: string | null;
	photoUrl: string | null;
	borderId: string | null;
};

/** A raw `sql` aggregate arrives as whatever the driver decided. */
const countOf = (value: string | number | null | undefined): number =>
	value === null || value === undefined ? 0 : Number(value);

const holderOf = (
	row: HolderRow | undefined,
	userId: string
): CategoryRecordHolder | undefined => {
	if (row === undefined) return undefined;

	const streak = countOf(row.best);
	if (!isRecordStreak(streak)) return undefined;

	const handle = row.handle === null ? row.displayName : `@${row.handle}`;
	if (handle === null) return undefined;

	const borderUrl =
		row.borderId === null ? undefined : findBorderById(row.borderId)?.image;

	return {
		handle,
		streak,
		you: row.userId === userId,
		...(row.photoUrl === null ? {} : { avatarUrl: row.photoUrl }),
		...(borderUrl === undefined ? {} : { borderUrl }),
		...(row.handle === null ? {} : { githubLogin: row.handle }),
	};
};

/**
 * A category's living record, and this account's best run in it.
 *
 * Two reads rather than one statement. The holder needs the whole category
 * folded; your own best needs only your rows, and pushing the account filter
 * down makes that second read cheap enough to be worth not sharing a CTE with
 * the first. Ordering the tie-break by `user_id` keeps the holder stable —
 * Postgres row order is otherwise arbitrary and the title would change hands
 * between two identical requests.
 */
export const fetchCategoryRecord = async (
	category: CategoryCode,
	userId: string,
	reader: DbReader = db
): Promise<CategoryRecord> => {
	const top = bestsIn(reader, category);
	const mine = bestsIn(reader, category, userId);

	const [holders, best] = await Promise.all([
		reader
			.select({
				userId: top.userId,
				best: top.best,
				handle: usersTable.github_username,
				displayName: usersTable.display_name,
				photoUrl: usersTable.photo_url,
				borderId: usersTable.equipped_border_id,
			})
			.from(top)
			.innerJoin(usersTable, eq(usersTable.id, top.userId))
			.orderBy(desc(top.best), asc(top.userId))
			.limit(1),
		reader.select({ best: mine.best }).from(mine).limit(1),
	]);

	const holder = holderOf(holders[0], userId);

	return {
		category,
		yourBest: countOf(best[0]?.best),
		...(holder === undefined ? {} : { holder }),
	};
};

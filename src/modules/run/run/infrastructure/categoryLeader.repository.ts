import { and, asc, desc, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { pollResponsesTable, pollsTable, usersTable } from "~/database/schema";
import { findBorderById } from "~/modules/account/profile/domain/border.model";
import { type CategoryCode, isCategoryCode } from "~/shared/lib/categories";

import type {
	CategoryBoards,
	CategoryLeader,
	CategoryMeasure,
	CategorySeat,
} from "~/modules/run/run/domain/categoryLeader.model";
import { isLeading } from "~/modules/run/run/domain/categoryLeader.model";
import type { DbReader } from "~/modules/run/run/infrastructure/runPolls.repository";

type Scope = {
	readonly category?: CategoryCode;
	readonly userId?: string;
};

const answersIn = (reader: DbReader, scope: Scope) =>
	reader
		.select({
			userId: pollResponsesTable.user_id,
			runId: pollResponsesTable.run_id,
			categoryCode: pollsTable.category_code,
			outcome: pollResponsesTable.outcome,
			broken:
				sql<number>`count(*) filter (where ${pollResponsesTable.outcome} = 'wrong') over (partition by ${pollResponsesTable.user_id}, ${pollResponsesTable.run_id}, ${pollsTable.category_code} order by ${pollResponsesTable.created_at}, ${pollResponsesTable.response_id} rows unbounded preceding)`.as(
					"broken"
				),
		})
		.from(pollResponsesTable)
		.innerJoin(pollsTable, eq(pollsTable.id, pollResponsesTable.poll_id))
		.where(
			and(
				eq(pollResponsesTable.mirrored, false),
				isNotNull(pollResponsesTable.user_id),
				isNotNull(pollResponsesTable.run_id),
				isNotNull(pollResponsesTable.outcome),
				scope.category === undefined
					? undefined
					: eq(pollsTable.category_code, scope.category),
				scope.userId === undefined
					? undefined
					: eq(pollResponsesTable.user_id, scope.userId)
			)
		)
		.as("answers");

const islandsIn = (reader: DbReader, scope: Scope) => {
	const answers = answersIn(reader, scope);

	return reader
		.select({
			userId: answers.userId,
			runId: answers.runId,
			categoryCode: answers.categoryCode,
			streak:
				sql<string>`count(*) filter (where ${answers.outcome} = 'correct')`.as(
					"streak"
				),
		})
		.from(answers)
		.groupBy(
			answers.userId,
			answers.runId,
			answers.categoryCode,
			answers.broken
		)
		.as("islands");
};

const runBestsIn = (reader: DbReader, scope: Scope) => {
	const islands = islandsIn(reader, scope);

	return reader
		.select({
			userId: islands.userId,
			categoryCode: islands.categoryCode,
			runStreak: sql<string>`max(${islands.streak})`.as("run_streak"),
			runCorrect: sql<string>`sum(${islands.streak})`.as("run_correct"),
		})
		.from(islands)
		.groupBy(islands.userId, islands.runId, islands.categoryCode)
		.as("run_bests");
};

const bestsIn = (reader: DbReader, scope: Scope) => {
	const runBests = runBestsIn(reader, scope);

	return reader
		.select({
			userId: runBests.userId,
			categoryCode: runBests.categoryCode,
			bestStreak: sql<string>`max(${runBests.runStreak})`.as("best_streak"),
			bestCorrect: sql<string>`max(${runBests.runCorrect})`.as("best_correct"),
		})
		.from(runBests)
		.groupBy(runBests.userId, runBests.categoryCode)
		.as("bests");
};

const LEADER_COLUMNS = {
	handle: usersTable.github_username,
	displayName: usersTable.display_name,
	photoUrl: usersTable.photo_url,
	borderId: usersTable.equipped_border_id,
};

type Figure = string | number | null;

type LeaderIdentity = {
	userId: string | null;
	handle: string | null;
	displayName: string | null;
	photoUrl: string | null;
	borderId: string | null;
};

type BoardRow = LeaderIdentity & {
	categoryCode: string;
	bestStreak: Figure;
	bestCorrect: Figure;
	streakRank: Figure;
	correctRank: Figure;
};

const STANDING = {
	streak: (row: BoardRow) => ({ best: row.bestStreak, rank: row.streakRank }),
	correct: (row: BoardRow) => ({
		best: row.bestCorrect,
		rank: row.correctRank,
	}),
} satisfies Record<
	CategoryMeasure,
	(row: BoardRow) => { best: Figure; rank: Figure }
>;

const TOP_RANK = 1;

const countOf = (value: Figure | undefined): number =>
	value === null || value === undefined ? 0 : Number(value);

const leaderOf = (
	row: LeaderIdentity,
	best: Figure,
	measure: CategoryMeasure,
	userId: string
): CategoryLeader | undefined => {
	if (row.userId === null) return undefined;

	const figure = countOf(best);
	if (!isLeading(measure, figure)) return undefined;

	const handle = row.handle === null ? row.displayName : `@${row.handle}`;
	if (handle === null) return undefined;

	const borderUrl =
		row.borderId === null ? undefined : findBorderById(row.borderId)?.image;

	return {
		userId: row.userId,
		handle,
		best: figure,
		you: row.userId === userId,
		...(row.photoUrl === null ? {} : { avatarUrl: row.photoUrl }),
		...(borderUrl === undefined ? {} : { borderUrl }),
	};
};

const seatsOf = (
	rows: readonly BoardRow[],
	measure: CategoryMeasure,
	userId: string
): CategorySeat[] =>
	rows.flatMap((row): CategorySeat[] => {
		const { best, rank } = STANDING[measure](row);
		if (countOf(rank) !== TOP_RANK || !isCategoryCode(row.categoryCode))
			return [];

		const leader = leaderOf(row, best, measure, userId);
		if (leader === undefined) return [];

		return [{ category: row.categoryCode, leader }];
	});

export const fetchCategoryLeader = async (
	category: CategoryCode,
	userId: string,
	reader: DbReader = db
): Promise<CategorySeat> => {
	const bests = bestsIn(reader, { category });

	const rows = await reader
		.select({
			userId: bests.userId,
			best: bests.bestStreak,
			...LEADER_COLUMNS,
		})
		.from(bests)
		.innerJoin(usersTable, eq(usersTable.id, bests.userId))
		.orderBy(desc(bests.bestStreak), asc(bests.userId))
		.limit(1);

	const row = rows[0];
	const leader =
		row === undefined ? undefined : leaderOf(row, row.best, "streak", userId);

	return { category, ...(leader === undefined ? {} : { leader }) };
};

export const fetchCategoryBoards = async (
	userId: string,
	reader: DbReader = db
): Promise<CategoryBoards> => {
	const bests = bestsIn(reader, {});

	const ranked = reader
		.select({
			categoryCode: bests.categoryCode,
			userId: bests.userId,
			bestStreak: bests.bestStreak,
			bestCorrect: bests.bestCorrect,
			...LEADER_COLUMNS,
			streakRank:
				sql<string>`row_number() over (partition by ${bests.categoryCode} order by ${bests.bestStreak} desc, ${bests.userId} asc)`.as(
					"streak_rank"
				),
			correctRank:
				sql<string>`row_number() over (partition by ${bests.categoryCode} order by ${bests.bestCorrect} desc, ${bests.userId} asc)`.as(
					"correct_rank"
				),
		})
		.from(bests)
		.innerJoin(usersTable, eq(usersTable.id, bests.userId))
		.as("ranked");

	const rows = await reader
		.select({
			categoryCode: ranked.categoryCode,
			userId: ranked.userId,
			bestStreak: ranked.bestStreak,
			bestCorrect: ranked.bestCorrect,
			streakRank: ranked.streakRank,
			correctRank: ranked.correctRank,
			handle: ranked.handle,
			displayName: ranked.displayName,
			photoUrl: ranked.photoUrl,
			borderId: ranked.borderId,
		})
		.from(ranked)
		.where(
			sql`${ranked.streakRank} = ${TOP_RANK} or ${ranked.correctRank} = ${TOP_RANK}`
		);

	return {
		streak: seatsOf(rows, "streak", userId),
		correct: seatsOf(rows, "correct", userId),
	};
};

export const fetchBestStreakOf = async (
	userId: string,
	reader: DbReader = db
): Promise<number> => {
	const runBests = runBestsIn(reader, { userId });

	const [row] = await reader
		.select({
			best: sql<string | null>`max(${runBests.runStreak})`.as("best"),
		})
		.from(runBests);

	return countOf(row?.best);
};

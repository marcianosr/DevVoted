import { and, eq, inArray, max, sum } from "drizzle-orm";

import { db } from "@/src/database/db";
import {
	leaderboardTable,
	runCategoryCoverageTable,
	runsTable,
	usersTable,
} from "@/src/database/schema";
import type { CategoryCode } from "~/domains/shared/categories";

import type { CategoryWinner } from "../models/award.model";

const AWARD_CATEGORY_CODES: CategoryCode[] = [
	"html",
	"css",
	"js",
	"ts",
	"react",
	"git",
	"general-frontend",
	"java",
];

const TOP_N = 5;

const getTopNPerCategory = (
	results: {
		userId: string;
		displayName: string;
		photoUrl: string | null;
		categoryCode: string;
		score: string | number | null;
	}[]
): CategoryWinner[] => {
	const byCategory = new Map<string, typeof results>();

	for (const row of results) {
		const existing = byCategory.get(row.categoryCode) ?? [];
		existing.push(row);
		byCategory.set(row.categoryCode, existing);
	}

	const ranked: CategoryWinner[] = [];

	for (const [categoryCode, entries] of byCategory) {
		const sorted = [...entries]
			.filter((e) => Number(e.score ?? 0) > 0)
			.sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0))
			.slice(0, TOP_N);

		for (const entry of sorted) {
			ranked.push({
				userId: entry.userId,
				displayName: entry.displayName,
				photoUrl: entry.photoUrl,
				categoryCode,
				score: Number(entry.score ?? 0),
			});
		}
	}

	return ranked;
};

export const getCategoryMasteryWinners = async (): Promise<
	CategoryWinner[]
> => {
	const results = await db
		.select({
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			categoryCode: runCategoryCoverageTable.category_code,
			score: sum(runCategoryCoverageTable.correct_polls_answered),
		})
		.from(runCategoryCoverageTable)
		.innerJoin(runsTable, eq(runCategoryCoverageTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.where(
			inArray(runCategoryCoverageTable.category_code, AWARD_CATEGORY_CODES)
		)
		.groupBy(
			runsTable.user_id,
			usersTable.display_name,
			usersTable.photo_url,
			runCategoryCoverageTable.category_code
		);

	return getTopNPerCategory(results);
};

export const getCategoryParticipationWinners = async (): Promise<
	CategoryWinner[]
> => {
	const results = await db
		.select({
			userId: leaderboardTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			categoryCode: leaderboardTable.category_code,
			score: sum(leaderboardTable.polls_answered),
		})
		.from(leaderboardTable)
		.innerJoin(usersTable, eq(leaderboardTable.user_id, usersTable.id))
		.where(inArray(leaderboardTable.category_code, AWARD_CATEGORY_CODES))
		.groupBy(
			leaderboardTable.user_id,
			usersTable.display_name,
			usersTable.photo_url,
			leaderboardTable.category_code
		);

	return getTopNPerCategory(results);
};

export const getCurrentRunMasteryWinners = async (): Promise<
	CategoryWinner[]
> => {
	const results = await db
		.select({
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			categoryCode: runCategoryCoverageTable.category_code,
			score: sum(runCategoryCoverageTable.correct_polls_answered),
		})
		.from(runCategoryCoverageTable)
		.innerJoin(runsTable, eq(runCategoryCoverageTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.where(
			and(
				inArray(runCategoryCoverageTable.category_code, AWARD_CATEGORY_CODES),
				eq(runsTable.status, "active")
			)
		)
		.groupBy(
			runsTable.user_id,
			usersTable.display_name,
			usersTable.photo_url,
			runCategoryCoverageTable.category_code
		);

	return getTopNPerCategory(results);
};

export const getCurrentRunParticipationWinners = async (): Promise<
	CategoryWinner[]
> => {
	const results = await db
		.select({
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			categoryCode: runCategoryCoverageTable.category_code,
			score: sum(runCategoryCoverageTable.polls_answered),
		})
		.from(runCategoryCoverageTable)
		.innerJoin(runsTable, eq(runCategoryCoverageTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.where(
			and(
				inArray(runCategoryCoverageTable.category_code, AWARD_CATEGORY_CODES),
				eq(runsTable.status, "active")
			)
		)
		.groupBy(
			runsTable.user_id,
			usersTable.display_name,
			usersTable.photo_url,
			runCategoryCoverageTable.category_code
		);

	return getTopNPerCategory(results);
};

export const getCategoryMaxCoverageWinners = async (): Promise<
	CategoryWinner[]
> => {
	const results = await db
		.select({
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			categoryCode: runCategoryCoverageTable.category_code,
			score: max(runCategoryCoverageTable.current_coverage),
		})
		.from(runCategoryCoverageTable)
		.innerJoin(runsTable, eq(runCategoryCoverageTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.where(
			inArray(runCategoryCoverageTable.category_code, AWARD_CATEGORY_CODES)
		)
		.groupBy(
			runsTable.user_id,
			usersTable.display_name,
			usersTable.photo_url,
			runCategoryCoverageTable.category_code
		);

	return getTopNPerCategory(results);
};

export const getCurrentRunMaxCoverageWinners = async (): Promise<
	CategoryWinner[]
> => {
	const results = await db
		.select({
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			categoryCode: runCategoryCoverageTable.category_code,
			score: max(runCategoryCoverageTable.current_coverage),
		})
		.from(runCategoryCoverageTable)
		.innerJoin(runsTable, eq(runCategoryCoverageTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.where(
			and(
				inArray(runCategoryCoverageTable.category_code, AWARD_CATEGORY_CODES),
				eq(runsTable.status, "active")
			)
		)
		.groupBy(
			runsTable.user_id,
			usersTable.display_name,
			usersTable.photo_url,
			runCategoryCoverageTable.category_code
		);

	return getTopNPerCategory(results);
};

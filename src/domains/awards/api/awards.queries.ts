import { eq, desc, max, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	runCategoryCoverageTable,
	runsTable,
	userAwardsTable,
	usersTable,
} from "~/database/schema";
import type { CategoryCode } from "~/domains/shared/categories";

import type {
	AwardHolder,
	AwardMetric,
	CategoryAwardWithHolder,
} from "../models/award";
import { getCategoryAwardDefinition } from "../models/award";

const METRICS: AwardMetric[] = ["coverage", "streak", "polls_answered"];

const METRIC_COLUMN = {
	coverage: runCategoryCoverageTable.current_coverage,
	streak: runCategoryCoverageTable.current_streak,
	polls_answered: runCategoryCoverageTable.polls_answered,
} as const;

// Single query per metric fetching top holders across ALL categories.
// Returns a map of categoryCode → [holder, runnerUp | null].
const getTopHoldersAllCategoriesForMetric = async (
	metric: AwardMetric
): Promise<Map<string, [AwardHolder, AwardHolder | null]>> => {
	const column = METRIC_COLUMN[metric];

	// Fetch all category/user combos ordered by category then value desc.
	// We take top-2 per category in application code to avoid a window function.
	const rows = await db
		.select({
			categoryCode: runCategoryCoverageTable.category_code,
			userId: usersTable.id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			value: max(column).as("max_value"),
		})
		.from(runCategoryCoverageTable)
		.innerJoin(runsTable, eq(runCategoryCoverageTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.where(eq(runsTable.status, "active"))
		.groupBy(
			runCategoryCoverageTable.category_code,
			usersTable.id,
			usersTable.display_name,
			usersTable.photo_url
		)
		.orderBy(runCategoryCoverageTable.category_code, desc(sql`max_value`));

	const byCategory = new Map<string, [AwardHolder, AwardHolder | null]>();

	for (const row of rows) {
		const holder: AwardHolder = {
			userId: row.userId,
			displayName: row.displayName,
			photoUrl: row.photoUrl,
			value: row.value ?? 0,
		};
		const existing = byCategory.get(row.categoryCode);
		if (!existing) {
			byCategory.set(row.categoryCode, [holder, null]);
		} else if (existing[1] === null) {
			existing[1] = holder;
		}
	}

	return byCategory;
};

// Returns true if this is the first time the user has held this award
export const claimAwardIfNew = async (
	userId: string,
	categoryCode: CategoryCode,
	metric: AwardMetric
): Promise<boolean> => {
	const inserted = await db
		.insert(userAwardsTable)
		.values({ user_id: userId, category_code: categoryCode, metric })
		.onConflictDoNothing()
		.returning({ id: userAwardsTable.id });

	return inserted.length > 0;
};

export const getAllCategoryAwards = async (
	currentUserId: string
): Promise<CategoryAwardWithHolder[]> => {
	const holderMaps = await Promise.all(
		METRICS.map((metric) => getTopHoldersAllCategoriesForMetric(metric))
	);

	const [coverageMap, streakMap, pollsMap] = holderMaps;
	const metricMaps: [
		AwardMetric,
		Map<string, [AwardHolder, AwardHolder | null]>,
	][] = [
		["coverage", coverageMap],
		["streak", streakMap],
		["polls_answered", pollsMap],
	];

	const results = await Promise.all(
		metricMaps.flatMap(([metric, map]) =>
			[...map.entries()].map(async ([code, [holder, runnerUp]]) => {
				if (holder.value === 0) return null;

				const categoryCode = code as CategoryCode;
				const isNewlyUnlocked =
					holder.userId === currentUserId
						? await claimAwardIfNew(currentUserId, categoryCode, metric)
						: false;

				return {
					award: getCategoryAwardDefinition(categoryCode, metric),
					holder,
					runnerUp,
					isNewlyUnlocked,
				};
			})
		)
	);

	return results.filter((r): r is CategoryAwardWithHolder => r !== null);
};

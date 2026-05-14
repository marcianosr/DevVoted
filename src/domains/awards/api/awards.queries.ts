import { eq, desc, max, sql, and } from "drizzle-orm";

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

const METRIC_COLUMN = {
	coverage: runCategoryCoverageTable.current_coverage,
	streak: runCategoryCoverageTable.current_streak,
	polls_answered: runCategoryCoverageTable.polls_answered,
} as const;

const getTopHoldersForMetric = async (
	categoryCode: CategoryCode,
	metric: AwardMetric
): Promise<[AwardHolder, AwardHolder | null]> => {
	const column = METRIC_COLUMN[metric];

	const rows = await db
		.select({
			userId: usersTable.id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			value: max(column).as("max_value"),
		})
		.from(runCategoryCoverageTable)
		.innerJoin(runsTable, eq(runCategoryCoverageTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.where(
			and(
				eq(runCategoryCoverageTable.category_code, categoryCode),
				eq(runsTable.status, "active")
			)
		)
		.groupBy(usersTable.id, usersTable.display_name, usersTable.photo_url)
		.orderBy(desc(sql`max_value`))
		.limit(2);

	const toHolder = (row: (typeof rows)[number]): AwardHolder => ({
		userId: row.userId,
		displayName: row.displayName,
		photoUrl: row.photoUrl,
		value: row.value ?? 0,
	});

	const [first, second] = rows;
	return [toHolder(first), second ? toHolder(second) : null];
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

export const getCategoryAwards = async (
	categoryCode: CategoryCode,
	currentUserId: string
): Promise<CategoryAwardWithHolder[]> => {
	const metrics: AwardMetric[] = ["coverage", "streak", "polls_answered"];

	const results = await Promise.all(
		metrics.map(async (metric) => {
			const [holder, runnerUp] = await getTopHoldersForMetric(
				categoryCode,
				metric
			);
			if (!holder || holder.value === 0) return null;

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
	);

	return results.filter((r): r is CategoryAwardWithHolder => r !== null);
};

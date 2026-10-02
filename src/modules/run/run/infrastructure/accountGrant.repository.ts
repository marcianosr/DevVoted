import { and, countDistinct, eq, inArray, isNull, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	pollResponsesTable,
	pollsTable,
	userConfigUnlocksTable,
	userObjectiveProgressTable,
	userServiceUnlocksTable,
	usersTable,
	userTitlesTable,
} from "~/database/schema";
import {
	type Title,
	TITLE_METRICS,
	titlesEarnedBy,
} from "~/modules/account/profile/domain/title.model";
import type {
	ObjectiveCount,
	ObjectiveMetric,
	UnlockGrant,
} from "~/modules/run/config/domain/configUnlock.model";
import {
	type AccountGrants,
	objectiveGrantsFor,
} from "~/modules/run/run/domain/accountGrant.model";
import type { ServiceUnlockGrant } from "~/modules/run/shop/domain/registryControl.model";

type Writer = Pick<typeof db, "update">;
type Inserter = Pick<typeof db, "insert">;
type Reader = Pick<typeof db, "select">;

const recordObjectiveProgress = async (
	tx: Inserter,
	userId: string,
	metrics: readonly ObjectiveMetric[]
): Promise<readonly ObjectiveCount[]> =>
	tx
		.insert(userObjectiveProgressTable)
		.values(metrics.map((metric) => ({ user_id: userId, metric, count: 1 })))
		.onConflictDoUpdate({
			target: [
				userObjectiveProgressTable.user_id,
				userObjectiveProgressTable.metric,
			],
			set: {
				count: sql`${userObjectiveProgressTable.count} + 1`,
				updated_at: new Date(),
			},
		})
		.returning({
			metric: userObjectiveProgressTable.metric,
			count: userObjectiveProgressTable.count,
		});

const awardConfigUnlocks = async (
	tx: Inserter,
	userId: string,
	grants: readonly UnlockGrant[]
): Promise<readonly string[]> => {
	const rows = await tx
		.insert(userConfigUnlocksTable)
		.values(
			grants.map((grant) => ({
				user_id: userId,
				config_id: grant.configId,
				via_metric: grant.viaMetric,
			}))
		)
		.onConflictDoNothing()
		.returning({ config_id: userConfigUnlocksTable.config_id });
	return rows.map((row) => row.config_id);
};

const awardServiceUnlocks = async (
	tx: Inserter,
	userId: string,
	grants: readonly ServiceUnlockGrant[]
): Promise<void> => {
	await tx
		.insert(userServiceUnlocksTable)
		.values(
			grants.map((grant) => ({
				user_id: userId,
				service_id: grant.serviceId,
				via_metric: grant.viaMetric,
			}))
		)
		.onConflictDoNothing();
};

export const applyObjectiveGrants = async (
	tx: Inserter,
	userId: string,
	metrics: readonly ObjectiveMetric[]
): Promise<readonly string[]> => {
	const counts = await recordObjectiveProgress(tx, userId, metrics);
	const grants = objectiveGrantsFor(counts);
	const unlocked =
		grants.configs.length === 0
			? []
			: await awardConfigUnlocks(tx, userId, grants.configs);
	if (grants.services.length > 0)
		await awardServiceUnlocks(tx, userId, grants.services);
	return unlocked;
};

const awardSwatch = async (
	tx: Writer,
	userId: string,
	swatchId: string
): Promise<void> => {
	await tx
		.update(usersTable)
		.set({
			owned_swatch_ids: sql`array_append(${usersTable.owned_swatch_ids}, ${swatchId})`,
		})
		.where(
			and(
				eq(usersTable.id, userId),
				sql`NOT (${usersTable.owned_swatch_ids} @> ARRAY[${swatchId}]::text[])`
			)
		);
};

const persistPinnedGate = async (
	tx: Writer,
	userId: string,
	pinnedGate: number
): Promise<void> => {
	await tx
		.update(usersTable)
		.set({ pinned_gate: pinnedGate })
		.where(eq(usersTable.id, userId));
};

const stampFirstInstalls = async (
	tx: Writer,
	userId: string,
	configIds: readonly string[]
): Promise<void> => {
	await tx
		.update(userConfigUnlocksTable)
		.set({ first_installed_at: sql`now()` })
		.where(
			and(
				eq(userConfigUnlocksTable.user_id, userId),
				inArray(userConfigUnlocksTable.config_id, configIds),
				isNull(userConfigUnlocksTable.first_installed_at)
			)
		);
};

const raiseStorageWatermark = async (
	tx: Writer,
	userId: string,
	peakKb: number
): Promise<void> => {
	await tx
		.update(usersTable)
		.set({
			peak_storage_kb: sql`GREATEST(${usersTable.peak_storage_kb}, ${peakKb})`,
		})
		.where(eq(usersTable.id, userId));
};

export const applyAccountGrants = async (
	tx: Writer,
	userId: string,
	grants: AccountGrants
): Promise<void> => {
	for (const swatchId of grants.swatchIds)
		await awardSwatch(tx, userId, swatchId);
	if (grants.pinnedGate !== null)
		await persistPinnedGate(tx, userId, grants.pinnedGate);
	if (grants.firstInstalledConfigIds.length > 0)
		await stampFirstInstalls(tx, userId, grants.firstInstalledConfigIds);
	if (grants.storageWatermarkKb !== null)
		await raiseStorageWatermark(tx, userId, grants.storageWatermarkKb);
};

export const fetchCategoryPollCounts = async (
	userId: string,
	executor: Reader = db
): Promise<readonly ObjectiveCount[]> => {
	const rows = await executor
		.select({
			categoryCode: pollsTable.category_code,
			seen: countDistinct(pollResponsesTable.poll_id),
			mastered:
				sql<number>`count(distinct ${pollResponsesTable.poll_id}) filter (where ${pollResponsesTable.outcome} = 'correct')`.mapWith(
					Number
				),
		})
		.from(pollResponsesTable)
		.innerJoin(pollsTable, eq(pollsTable.id, pollResponsesTable.poll_id))
		.where(eq(pollResponsesTable.user_id, userId))
		.groupBy(pollsTable.category_code);

	return rows.flatMap((row) => [
		{ metric: `category-seen:${row.categoryCode}`, count: row.seen },
		{ metric: `category-mastered:${row.categoryCode}`, count: row.mastered },
	]);
};

const awardTitles = async (
	tx: Inserter,
	userId: string,
	titles: readonly Title[]
): Promise<readonly string[]> => {
	const grantedAt = new Date();
	const rows = await tx
		.insert(userTitlesTable)
		.values(
			titles.map((title) => ({
				user_id: userId,
				title_id: title.id,
				announced_at: grantedAt,
			}))
		)
		.onConflictDoNothing()
		.returning({ title_id: userTitlesTable.title_id });
	return rows.map((row) => row.title_id);
};

export const grantEarnedTitles = async (
	tx: Reader & Inserter,
	userId: string
): Promise<readonly string[]> => {
	const counts = await tx
		.select({
			metric: userObjectiveProgressTable.metric,
			count: userObjectiveProgressTable.count,
		})
		.from(userObjectiveProgressTable)
		.where(
			and(
				eq(userObjectiveProgressTable.user_id, userId),
				inArray(userObjectiveProgressTable.metric, [...TITLE_METRICS])
			)
		);
	const categoryPollCounts = await fetchCategoryPollCounts(userId, tx);
	const earned = titlesEarnedBy([...counts, ...categoryPollCounts]);
	if (earned.length === 0) return [];
	return awardTitles(tx, userId, earned);
};

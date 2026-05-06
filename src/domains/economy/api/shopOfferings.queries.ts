import { eq, and, desc } from "drizzle-orm";

import { db } from "~/database/db";
import {
	runShopOfferingsTable,
	dailyExposedDeckTable,
	runsTable,
	usersTable,
} from "~/database/schema";

export type ShopOfferingRecord = typeof runShopOfferingsTable.$inferSelect;
export type DailyExposedDeckRecord = typeof dailyExposedDeckTable.$inferSelect;

/**
 * Get shop offerings for a specific run, date, and reroll number.
 */
export const getShopOfferings = async (
	runId: number,
	date: string,
	rerollNumber: number
): Promise<ShopOfferingRecord | null> => {
	const [record] = await db
		.select()
		.from(runShopOfferingsTable)
		.where(
			and(
				eq(runShopOfferingsTable.run_id, runId),
				eq(runShopOfferingsTable.date, date),
				eq(runShopOfferingsTable.reroll_number, rerollNumber)
			)
		)
		.limit(1);

	return record ?? null;
};

/**
 * Get the latest shop offering for a run on a specific date.
 * Returns the highest reroll_number entry for that day.
 */
export const getLatestShopOfferingsForDate = async (
	runId: number,
	date: string
): Promise<ShopOfferingRecord | null> => {
	const [record] = await db
		.select()
		.from(runShopOfferingsTable)
		.where(
			and(
				eq(runShopOfferingsTable.run_id, runId),
				eq(runShopOfferingsTable.date, date)
			)
		)
		.orderBy(desc(runShopOfferingsTable.reroll_number))
		.limit(1);

	return record ?? null;
};

/**
 * Get the locked shop offering for a run (ignores date).
 * Used when yarn.lock config is active - returns offering with is_locked=true.
 */
export const getLockedShopOffering = async (
	runId: number
): Promise<ShopOfferingRecord | null> => {
	const [record] = await db
		.select()
		.from(runShopOfferingsTable)
		.where(
			and(
				eq(runShopOfferingsTable.run_id, runId),
				eq(runShopOfferingsTable.is_locked, true)
			)
		)
		.orderBy(desc(runShopOfferingsTable.created_at))
		.limit(1);

	return record ?? null;
};

/**
 * Store new shop offerings in the database.
 */
export const storeShopOfferings = async (
	runId: number,
	date: string,
	rerollNumber: number,
	configIds: string[],
	isLocked: boolean = false
): Promise<ShopOfferingRecord> => {
	const [record] = await db
		.insert(runShopOfferingsTable)
		.values({
			run_id: runId,
			date,
			reroll_number: rerollNumber,
			config_ids: configIds,
			is_locked: isLocked,
		})
		.returning();

	return record;
};

/**
 * Pre-generate the "next" slot offering — silently skips if already exists.
 */
export const storeNextShopOfferings = async (
	runId: number,
	date: string,
	rerollNumber: number,
	configIds: string[],
	isLocked: boolean = false
): Promise<void> => {
	await db
		.insert(runShopOfferingsTable)
		.values({
			run_id: runId,
			date,
			reroll_number: rerollNumber,
			config_ids: configIds,
			is_locked: isLocked,
		})
		.onConflictDoNothing();
};

/**
 * Get the latest reroll number for a run on a specific date.
 * Returns -1 if no offerings exist for that date.
 */
export const getLatestRerollNumber = async (
	runId: number,
	date: string
): Promise<number> => {
	const offering = await getLatestShopOfferingsForDate(runId, date);
	return offering?.reroll_number ?? -1;
};

/**
 * Get the daily exposed deck entry for a specific date.
 */
export const getDailyExposedDeck = async (
	date: string
): Promise<DailyExposedDeckRecord | null> => {
	const [record] = await db
		.select()
		.from(dailyExposedDeckTable)
		.where(eq(dailyExposedDeckTable.date, date))
		.limit(1);

	return record ?? null;
};

export type ExposedDeckWithDetails = {
	userId: string;
	displayName: string;
	photoUrl: string | null;
	configIds: string[];
	runId: number;
};

/**
 * Get the daily exposed deck with user and run details.
 */
export const getDailyExposedDeckWithDetails = async (
	date: string
): Promise<ExposedDeckWithDetails | null> => {
	const [record] = await db
		.select({
			userId: dailyExposedDeckTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			configIds: runsTable.active_config_ids,
			runId: dailyExposedDeckTable.run_id,
		})
		.from(dailyExposedDeckTable)
		.innerJoin(usersTable, eq(dailyExposedDeckTable.user_id, usersTable.id))
		.innerJoin(runsTable, eq(dailyExposedDeckTable.run_id, runsTable.id))
		.where(eq(dailyExposedDeckTable.date, date))
		.limit(1);

	return record ?? null;
};

/**
 * Store the daily exposed deck selection.
 */
export const storeDailyExposedDeck = async (
	date: string,
	runId: number,
	userId: string
): Promise<DailyExposedDeckRecord> => {
	const [record] = await db
		.insert(dailyExposedDeckTable)
		.values({
			date,
			run_id: runId,
			user_id: userId,
		})
		.returning();

	return record;
};

/**
 * Get all active runs excluding a specific user.
 * Used for selecting a random exposed deck.
 */
export const getActiveRunsExcludingUser = async (excludeUserId: string) => {
	const activeRuns = await db
		.select({
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			configIds: runsTable.active_config_ids,
			runId: runsTable.id,
		})
		.from(runsTable)
		.innerJoin(usersTable, eq(runsTable.user_id, usersTable.id))
		.where(eq(runsTable.status, "active"));

	return activeRuns.filter((run) => run.userId !== excludeUserId);
};

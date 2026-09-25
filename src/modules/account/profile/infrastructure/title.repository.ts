import { and, eq, inArray, isNull } from "drizzle-orm";

import { db } from "~/database/db";
import { usersTable, userTitlesTable } from "~/database/schema";

export type UserTitleState = {
	readonly ownedTitleIds: readonly string[];
	readonly equippedTitleId: string | null;
};

export const fetchOwnedTitleIds = async (
	userId: string
): Promise<readonly string[]> => {
	const rows = await db
		.select({ titleId: userTitlesTable.title_id })
		.from(userTitlesTable)
		.where(eq(userTitlesTable.user_id, userId));

	return rows.map((row) => row.titleId);
};

export const fetchUserTitleState = async (
	userId: string
): Promise<UserTitleState | null> => {
	const [user] = await db
		.select({ equippedTitleId: usersTable.equipped_title_id })
		.from(usersTable)
		.where(eq(usersTable.id, userId))
		.limit(1);

	if (!user) return null;
	return {
		ownedTitleIds: await fetchOwnedTitleIds(userId),
		equippedTitleId: user.equippedTitleId,
	};
};

/**
 * Equipping proves ownership in the WHERE clause rather than in a read before
 * the write, so two requests cannot race between the check and the update. A
 * title the account does not hold matches no row and changes nothing, which is
 * what the null return reports.
 */
export const setEquippedTitle = async (
	userId: string,
	titleId: string | null
): Promise<UserTitleState | null> => {
	if (titleId !== null) {
		const [owned] = await db
			.select({ titleId: userTitlesTable.title_id })
			.from(userTitlesTable)
			.where(
				and(
					eq(userTitlesTable.user_id, userId),
					eq(userTitlesTable.title_id, titleId)
				)
			)
			.limit(1);
		if (!owned) return null;
	}

	const [row] = await db
		.update(usersTable)
		.set({ equipped_title_id: titleId })
		.where(eq(usersTable.id, userId))
		.returning({ equippedTitleId: usersTable.equipped_title_id });

	if (!row) return null;
	return {
		ownedTitleIds: await fetchOwnedTitleIds(userId),
		equippedTitleId: row.equippedTitleId,
	};
};

/** The worn title of many accounts at once, for the surfaces that draw others. */
export const fetchEquippedTitleIds = async (
	userIds: readonly string[]
): Promise<ReadonlyMap<string, string>> => {
	if (userIds.length === 0) return new Map();
	const rows = await db
		.select({ id: usersTable.id, titleId: usersTable.equipped_title_id })
		.from(usersTable)
		.where(inArray(usersTable.id, [...userIds]));

	return new Map(
		rows.flatMap((row) => (row.titleId ? [[row.id, row.titleId] as const] : []))
	);
};

/** The titles this account holds but has never been shown. */
export const fetchUnannouncedTitleIds = async (
	userId: string
): Promise<readonly string[]> => {
	const rows = await db
		.select({ titleId: userTitlesTable.title_id })
		.from(userTitlesTable)
		.where(
			and(
				eq(userTitlesTable.user_id, userId),
				isNull(userTitlesTable.announced_at)
			)
		);

	return rows.map((row) => row.titleId);
};

/**
 * Stamps only the titles that were actually shown, never every unannounced row:
 * one earned while the notice was open has not been seen, and stamping it here
 * would bury it behind a modal the player has already closed. The null check
 * keeps a second dismiss from moving a timestamp that is already set.
 */
export const markTitlesAnnounced = async (
	userId: string,
	titleIds: readonly string[]
): Promise<void> => {
	if (titleIds.length === 0) return;

	await db
		.update(userTitlesTable)
		.set({ announced_at: new Date() })
		.where(
			and(
				eq(userTitlesTable.user_id, userId),
				inArray(userTitlesTable.title_id, [...titleIds]),
				isNull(userTitlesTable.announced_at)
			)
		);
};

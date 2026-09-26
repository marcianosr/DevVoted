import { and, eq, inArray, isNull } from "drizzle-orm";

import { db } from "~/database/db";
import { usersTable, userTitlesTable } from "~/database/schema";

export type UserTitleState = {
	readonly ownedTitleIds: readonly string[];
	readonly equippedTitleIds: readonly string[];
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
		.select({ equippedTitleIds: usersTable.equipped_title_ids })
		.from(usersTable)
		.where(eq(usersTable.id, userId))
		.limit(1);

	if (!user) return null;
	return {
		ownedTitleIds: await fetchOwnedTitleIds(userId),
		equippedTitleIds: user.equippedTitleIds,
	};
};

export const setEquippedTitles = async (
	userId: string,
	titleIds: readonly string[]
): Promise<UserTitleState | null> => {
	const ownedTitleIds = await fetchOwnedTitleIds(userId);
	if (titleIds.some((titleId) => !ownedTitleIds.includes(titleId))) return null;

	const [row] = await db
		.update(usersTable)
		.set({ equipped_title_ids: [...titleIds] })
		.where(eq(usersTable.id, userId))
		.returning({ equippedTitleIds: usersTable.equipped_title_ids });

	if (!row) return null;
	return { ownedTitleIds, equippedTitleIds: row.equippedTitleIds };
};

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

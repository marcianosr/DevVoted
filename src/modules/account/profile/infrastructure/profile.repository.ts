import { eq, inArray, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { usersTable } from "~/database/schema";

export const fetchUserDisplayName = async (
	userId: string
): Promise<string | null> => {
	const [user] = await db
		.select({ displayName: usersTable.display_name })
		.from(usersTable)
		.where(eq(usersTable.id, userId))
		.limit(1);

	return user?.displayName ?? null;
};

export type PublicUser = {
	id: string;
	displayName: string;
	photoUrl: string | null;
	githubUsername: string | null;
};

export const fetchUsersByDisplayNames = async (
	displayNames: string[]
): Promise<PublicUser[]> => {
	const users = await db
		.select({
			id: usersTable.id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			githubUsername: usersTable.github_username,
		})
		.from(usersTable)
		.where(inArray(usersTable.display_name, displayNames));

	return users;
};

export type UserArchiveState = {
	archivedStorage: number;
	ownedBorderIds: string[];
	equippedBorderId: string | null;
};

const archiveColumns = {
	archivedStorage: usersTable.archived_storage,
	ownedBorderIds: usersTable.owned_border_ids,
	equippedBorderId: usersTable.equipped_border_id,
};

export const fetchUserArchiveState = async (
	userId: string
): Promise<UserArchiveState | null> => {
	const [row] = await db
		.select(archiveColumns)
		.from(usersTable)
		.where(eq(usersTable.id, userId))
		.limit(1);

	return row ?? null;
};

export const purchaseBorderTx = async (
	userId: string,
	borderId: string,
	cost: number
): Promise<UserArchiveState | null> =>
	db.transaction(async (tx) => {
		const [user] = await tx
			.select(archiveColumns)
			.from(usersTable)
			.where(eq(usersTable.id, userId))
			.limit(1);

		if (!user) return null;
		if (user.ownedBorderIds.includes(borderId)) return null;
		if (user.archivedStorage < cost) return null;

		const [row] = await tx
			.update(usersTable)
			.set({
				archived_storage: sql`${usersTable.archived_storage} - ${cost}`,
				owned_border_ids: sql`array_append(${usersTable.owned_border_ids}, ${borderId})`,
			})
			.where(eq(usersTable.id, userId))
			.returning(archiveColumns);

		return row ?? null;
	});

export const setEquippedBorder = async (
	userId: string,
	borderId: string | null
): Promise<UserArchiveState | null> => {
	const [row] = await db
		.update(usersTable)
		.set({ equipped_border_id: borderId })
		.where(eq(usersTable.id, userId))
		.returning(archiveColumns);

	return row ?? null;
};

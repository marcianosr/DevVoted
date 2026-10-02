import { and, count, countDistinct, eq, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { pollResponsesTable, pollsTable, usersTable } from "~/database/schema";
import type { AuthorRole } from "~/modules/account/profile/domain/authorship.model";
import type { Look } from "~/modules/account/profile/domain/look.model";

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

export type PublicProfileRow = {
	id: string;
	displayName: string;
	photoUrl: string | null;
	githubUsername: string | null;
	equippedBorderId: string | null;
	equippedTitleIds: string[];
	archivedStorage: number;
	ownedSwatchIds: string[];
	equippedSwatchId: string | null;
	role: AuthorRole;
};

export const fetchPublicProfile = async (
	userId: string
): Promise<PublicProfileRow | null> => {
	const [row] = await db
		.select({
			id: usersTable.id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			githubUsername: usersTable.github_username,
			equippedBorderId: usersTable.equipped_border_id,
			equippedTitleIds: usersTable.equipped_title_ids,
			archivedStorage: usersTable.archived_storage,
			ownedSwatchIds: usersTable.owned_swatch_ids,
			equippedSwatchId: usersTable.equipped_swatch_id,
			role: usersTable.role,
		})
		.from(usersTable)
		.where(eq(usersTable.id, userId))
		.limit(1);

	return row ?? null;
};

export type PublishedPollCounts = {
	published: number;
	answers: number;
};

export const fetchPublishedPollCounts = async (
	userId: string
): Promise<PublishedPollCounts> => {
	const [row] = await db
		.select({
			published: countDistinct(pollsTable.id),
			answers: count(pollResponsesTable.response_id),
		})
		.from(pollsTable)
		.leftJoin(pollResponsesTable, eq(pollResponsesTable.poll_id, pollsTable.id))
		.where(
			and(eq(pollsTable.created_by, userId), eq(pollsTable.status, "published"))
		);

	return {
		published: Number(row?.published ?? 0),
		answers: Number(row?.answers ?? 0),
	};
};

export type UserArchiveState = {
	archivedStorage: number;
	ownedBorderIds: string[];
	equippedBorderId: string | null;
	ownedSwatchIds: string[];
	equippedSwatchId: string | null;
};

const archiveColumns = {
	archivedStorage: usersTable.archived_storage,
	ownedBorderIds: usersTable.owned_border_ids,
	equippedBorderId: usersTable.equipped_border_id,
	ownedSwatchIds: usersTable.owned_swatch_ids,
	equippedSwatchId: usersTable.equipped_swatch_id,
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

export const setEquippedLook = async (
	userId: string,
	look: Look
): Promise<Look | null> => {
	const [row] = await db
		.update(usersTable)
		.set({
			equipped_border_id: look.borderId,
			equipped_title_ids: [...look.titleIds],
			equipped_swatch_id: look.swatchId,
		})
		.where(eq(usersTable.id, userId))
		.returning({
			borderId: usersTable.equipped_border_id,
			titleIds: usersTable.equipped_title_ids,
			swatchId: usersTable.equipped_swatch_id,
		});

	return row ?? null;
};

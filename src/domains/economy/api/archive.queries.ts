import { eq, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { usersTable } from "~/database/schema";

export type UserArchiveState = {
	archivedStorage: number;
	ownedBorderIds: string[];
	equippedBorderId: string | null;
};

export const fetchUserArchiveState = async (
	userId: string
): Promise<UserArchiveState | null> => {
	const [row] = await db
		.select({
			archivedStorage: usersTable.archived_storage,
			ownedBorderIds: usersTable.owned_border_ids,
			equippedBorderId: usersTable.equipped_border_id,
		})
		.from(usersTable)
		.where(eq(usersTable.id, userId))
		.limit(1);

	if (!row) return null;

	return {
		archivedStorage: row.archivedStorage,
		ownedBorderIds: row.ownedBorderIds,
		equippedBorderId: row.equippedBorderId,
	};
};

// Atomic credit using SQL expression — safe under concurrency (two finishing
// runs from the same user can't race-clobber each other's credit).
export const creditArchivedStorage = async (
	userId: string,
	bytes: number
): Promise<number> => {
	if (bytes <= 0) {
		const current = await fetchUserArchiveState(userId);
		return current?.archivedStorage ?? 0;
	}

	const [row] = await db
		.update(usersTable)
		.set({
			archived_storage: sql`${usersTable.archived_storage} + ${bytes}`,
		})
		.where(eq(usersTable.id, userId))
		.returning({ archivedStorage: usersTable.archived_storage });

	return row?.archivedStorage ?? 0;
};

// Atomic purchase: deducts cost and appends border id only if the user has
// enough balance AND doesn't already own it. Returns null when either check
// fails so callers can surface the right error.
export const purchaseBorderTx = async (
	userId: string,
	borderId: string,
	cost: number
): Promise<UserArchiveState | null> => {
	return db.transaction(async (tx) => {
		const [user] = await tx
			.select({
				archivedStorage: usersTable.archived_storage,
				ownedBorderIds: usersTable.owned_border_ids,
				equippedBorderId: usersTable.equipped_border_id,
			})
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
			.returning({
				archivedStorage: usersTable.archived_storage,
				ownedBorderIds: usersTable.owned_border_ids,
				equippedBorderId: usersTable.equipped_border_id,
			});

		if (!row) return null;

		return {
			archivedStorage: row.archivedStorage,
			ownedBorderIds: row.ownedBorderIds,
			equippedBorderId: row.equippedBorderId,
		};
	});
};

// Set or unset (null) the equipped border. Caller is responsible for verifying
// ownership before calling.
export const setEquippedBorder = async (
	userId: string,
	borderId: string | null
): Promise<UserArchiveState | null> => {
	const [row] = await db
		.update(usersTable)
		.set({ equipped_border_id: borderId })
		.where(eq(usersTable.id, userId))
		.returning({
			archivedStorage: usersTable.archived_storage,
			ownedBorderIds: usersTable.owned_border_ids,
			equippedBorderId: usersTable.equipped_border_id,
		});

	if (!row) return null;

	return {
		archivedStorage: row.archivedStorage,
		ownedBorderIds: row.ownedBorderIds,
		equippedBorderId: row.equippedBorderId,
	};
};

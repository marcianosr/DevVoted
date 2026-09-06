import { eq } from "drizzle-orm";

import { db } from "~/database/db";
import { userConfigUnlocksTable, usersTable } from "~/database/schema";

import { FREE_CONFIG_IDS } from "~/modules/run/config/domain/configUnlock.model";

/** The account as the app knows it, in app-shaped names rather than DB columns. */
export type AccountUser = {
	id: string;
	email: string;
	displayName?: string;
	photoUrl?: string | null;
};

type UserRow = typeof usersTable.$inferSelect;

const toAccountUser = (row: UserRow): AccountUser => ({
	id: row.id,
	email: row.email,
	displayName: row.display_name ?? undefined,
	photoUrl: row.photo_url,
});

export const findUserById = async (
	id: string
): Promise<AccountUser | undefined> => {
	const [row] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, id))
		.limit(1);
	return row ? toAccountUser(row) : undefined;
};

export const findUserByEmail = async (
	email: string
): Promise<AccountUser | undefined> => {
	const [row] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email))
		.limit(1);
	return row ? toAccountUser(row) : undefined;
};

/**
 * Signup seeds the free starter set into user_config_unlocks with no
 * provenance (ADR-064: via_metric null reads as "Starter config" in the Dex).
 * One transaction, so an account never exists without its free grants.
 */
export const insertUser = async (user: AccountUser): Promise<AccountUser> =>
	db.transaction(async (tx) => {
		const [row] = await tx
			.insert(usersTable)
			.values({
				id: user.id,
				display_name: user.displayName || user.email.split("@")[0],
				email: user.email,
				photo_url: user.photoUrl || null,
				role: "user" as const,
			})
			.returning();
		await tx
			.insert(userConfigUnlocksTable)
			.values(
				FREE_CONFIG_IDS.map((configId) => ({
					user_id: row.id,
					config_id: configId,
					via_metric: null,
				}))
			)
			.onConflictDoNothing();
		return toAccountUser(row);
	});

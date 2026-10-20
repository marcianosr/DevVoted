import { and, eq, isNull, lt, or, sql } from "drizzle-orm";

import { db } from "~/database/db";
import { userConfigUnlocksTable, usersTable } from "~/database/schema";

import { FREE_CONFIG_IDS } from "~/modules/run/config/domain/configUnlock.model";

export type AccountUser = {
	id: string;
	email: string | null;
	displayName?: string;
	photoUrl?: string | null;
	isGuest: boolean;
};

const GUEST_DISPLAY_NAME = "Guest";

type UserRow = typeof usersTable.$inferSelect;

const toAccountUser = (row: UserRow): AccountUser => ({
	id: row.id,
	email: row.email,
	displayName: row.display_name ?? undefined,
	photoUrl: row.photo_url,
	isGuest: row.is_guest,
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

const displayNameFor = (user: AccountUser): string =>
	user.displayName || user.email?.split("@")[0] || GUEST_DISPLAY_NAME;

export const insertUser = async (user: AccountUser): Promise<AccountUser> =>
	db.transaction(async (tx) => {
		const [row] = await tx
			.insert(usersTable)
			.values({
				id: user.id,
				display_name: displayNameFor(user),
				email: user.email,
				is_guest: user.isGuest,
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

export const touchLastSeen = async (userId: string): Promise<void> => {
	await db
		.update(usersTable)
		.set({ last_seen_at: sql`now()` })
		.where(
			and(
				eq(usersTable.id, userId),
				or(
					isNull(usersTable.last_seen_at),
					lt(usersTable.last_seen_at, sql`date_trunc('day', now())`)
				)
			)
		);
};

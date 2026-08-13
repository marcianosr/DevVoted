import { eq, inArray } from "drizzle-orm";

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

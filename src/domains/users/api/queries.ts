import { eq } from "drizzle-orm";

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

import { and, eq, gte } from "drizzle-orm";

import { db } from "~/database/db";
import { userServiceUnlocksTable } from "~/database/schema";

export const fetchUnlockedServiceIds = async (
	userId: string
): Promise<readonly string[]> => {
	const rows = await db
		.select({ service_id: userServiceUnlocksTable.service_id })
		.from(userServiceUnlocksTable)
		.where(eq(userServiceUnlocksTable.user_id, userId));

	return rows.map((row) => row.service_id);
};

export const fetchServiceUnlocksSince = async (
	userId: string,
	since: Date
): Promise<readonly string[]> => {
	const rows = await db
		.select({ service_id: userServiceUnlocksTable.service_id })
		.from(userServiceUnlocksTable)
		.where(
			and(
				eq(userServiceUnlocksTable.user_id, userId),
				gte(userServiceUnlocksTable.unlocked_at, since)
			)
		);

	return rows.map((row) => row.service_id);
};

import { eq } from "drizzle-orm";

import { db } from "~/database/db";
import { userServiceUnlocksTable } from "~/database/schema";

/** Every service this account has earned; starter services carry no row. */
export const fetchUnlockedServiceIds = async (
	userId: string
): Promise<readonly string[]> => {
	const rows = await db
		.select({ service_id: userServiceUnlocksTable.service_id })
		.from(userServiceUnlocksTable)
		.where(eq(userServiceUnlocksTable.user_id, userId));

	return rows.map((row) => row.service_id);
};

import { and, asc, eq, gte } from "drizzle-orm";

import { db } from "~/database/db";
import { userConfigUnlocksTable } from "~/database/schema";

export type UnlockRow = {
	readonly configId: string;
	readonly viaMetric: string | null;
};

export const fetchUnlocksSince = async (
	userId: string,
	since: Date
): Promise<readonly UnlockRow[]> => {
	const rows = await db
		.select({
			config_id: userConfigUnlocksTable.config_id,
			via_metric: userConfigUnlocksTable.via_metric,
		})
		.from(userConfigUnlocksTable)
		.where(
			and(
				eq(userConfigUnlocksTable.user_id, userId),
				gte(userConfigUnlocksTable.unlocked_at, since)
			)
		)
		.orderBy(asc(userConfigUnlocksTable.unlocked_at));
	return rows.map((row) => ({
		configId: row.config_id,
		viaMetric: row.via_metric,
	}));
};

import { asc, eq } from "drizzle-orm";

import { db } from "~/database/db";
import {
	userConfigUnlocksTable,
	userObjectiveProgressTable,
} from "~/database/schema";

export type ConfigUnlockRow = {
	configId: string;
	viaMetric: string | null;
};

/** Every config the account has been granted, free set included. */
export const fetchConfigUnlocksByUser = async (
	userId: string
): Promise<ConfigUnlockRow[]> =>
	db
		.select({
			configId: userConfigUnlocksTable.config_id,
			viaMetric: userConfigUnlocksTable.via_metric,
		})
		.from(userConfigUnlocksTable)
		.where(eq(userConfigUnlocksTable.user_id, userId))
		.orderBy(asc(userConfigUnlocksTable.unlocked_at));

export type ObjectiveProgressRow = {
	metric: string;
	count: number;
};

/** The account's lifetime objective counters, one row per touched metric. */
export const fetchObjectiveProgressByUser = async (
	userId: string
): Promise<ObjectiveProgressRow[]> =>
	db
		.select({
			metric: userObjectiveProgressTable.metric,
			count: userObjectiveProgressTable.count,
		})
		.from(userObjectiveProgressTable)
		.where(eq(userObjectiveProgressTable.user_id, userId));

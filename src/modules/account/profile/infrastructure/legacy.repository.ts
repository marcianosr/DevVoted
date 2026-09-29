import { and, asc, eq } from "drizzle-orm";

import { db } from "~/database/db";
import { runsTable, usersTable } from "~/database/schema";

const CALENDAR_MODE = "calendar";
const ARCHIVED_REASON = "archived";

export const fetchArchivedRunStartedAt = async (
	userId: string
): Promise<Date | null> => {
	const [row] = await db
		.select({ startedAt: runsTable.started_at })
		.from(runsTable)
		.where(
			and(
				eq(runsTable.user_id, userId),
				eq(runsTable.mode, CALENDAR_MODE),
				eq(runsTable.completion_reason, ARCHIVED_REASON)
			)
		)
		.orderBy(asc(runsTable.started_at))
		.limit(1);

	return row?.startedAt ?? null;
};

export const fetchLegacyBonusBytes = async (
	userId: string
): Promise<number | null> => {
	const [row] = await db
		.select({ bytes: usersTable.legacy_bonus_bytes })
		.from(usersTable)
		.where(eq(usersTable.id, userId))
		.limit(1);

	return row?.bytes ?? null;
};

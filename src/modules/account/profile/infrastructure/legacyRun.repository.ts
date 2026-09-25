import { and, asc, eq } from "drizzle-orm";

import { db } from "~/database/db";
import { runsTable } from "~/database/schema";

const CALENDAR_MODE = "calendar";
const ARCHIVED_REASON = "archived";

/**
 * When this account's archived calendar run began. The run engine owns a live
 * run; a calendar run closed by the rebuild is only a fact about the account's
 * history, which is why the profile reads it rather than asking the run module
 * for a run nothing can resume.
 */
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

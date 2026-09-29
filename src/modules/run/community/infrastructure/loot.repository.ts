import { and, eq, isNull } from "drizzle-orm";

import { db } from "~/database/db";
import { runsTable } from "~/database/schema";

type Writer = Pick<typeof db, "update">;

export const ALREADY_LOOTED = "Somebody got to that run first";

export const claimFallenRun = async (
	tx: Writer,
	{
		fallenRunId,
		looterUserId,
		kb,
	}: {
		fallenRunId: number;
		looterUserId: string;
		kb: number;
	}
): Promise<void> => {
	const claimed = await tx
		.update(runsTable)
		.set({
			looted_by_user_id: looterUserId,
			looted_at: new Date(),
			loot_amount: kb,
		})
		.where(
			and(eq(runsTable.id, fallenRunId), isNull(runsTable.looted_by_user_id))
		)
		.returning({ id: runsTable.id });

	if (claimed.length === 0) throw new Error(ALREADY_LOOTED);
};

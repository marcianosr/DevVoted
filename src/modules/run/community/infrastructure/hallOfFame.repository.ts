import { and, desc, eq, isNotNull } from "drizzle-orm";

import { db } from "~/database/db";
import { runStatesTable, runsTable, usersTable } from "~/database/schema";
import { borderUrlOf } from "~/modules/account/profile/domain/border.model";
import { startedAtGateColumn } from "~/modules/run/community/infrastructure/climbers.repository";

export type ChampionRow = {
	runId: number;
	userId: string;
	displayName: string | null;
	photoUrl: string | null;
	borderUrl: string | null;
	wonAt: Date;
};

export const fetchChampions = async (): Promise<ChampionRow[]> => {
	const rows = await db
		.select({
			runId: runsTable.id,
			userId: runsTable.user_id,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
			equippedBorderId: usersTable.equipped_border_id,
			wonAt: runsTable.victory_achieved_at,
		})
		.from(runsTable)
		.innerJoin(runStatesTable, eq(runStatesTable.run_id, runsTable.id))
		.innerJoin(usersTable, eq(usersTable.id, runsTable.user_id))
		.where(
			and(
				eq(runsTable.mode, "session"),
				eq(runsTable.completion_reason, "victory"),
				isNotNull(runsTable.victory_achieved_at),
				eq(startedAtGateColumn, 0)
			)
		)
		.orderBy(desc(runsTable.victory_achieved_at));

	return rows.flatMap(({ equippedBorderId, wonAt, ...row }) =>
		wonAt === null
			? []
			: [{ ...row, wonAt, borderUrl: borderUrlOf(equippedBorderId) }]
	);
};

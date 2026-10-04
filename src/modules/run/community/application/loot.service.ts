import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import {
	type LootRefusal,
	lootRefusalOf,
} from "~/modules/run/community/domain/loot.model";
import type { FallenRow } from "~/modules/run/community/infrastructure/climbers.repository";
import { fetchFallenRun } from "~/modules/run/community/infrastructure/climbers.repository";
import {
	ALREADY_LOOTED,
	claimFallenRun,
} from "~/modules/run/community/infrastructure/loot.repository";
import { settleIncidents } from "~/modules/run/incident/application/incidentSettlement.service";
import { dispatchRunActionService } from "~/modules/run/run/application/run.service";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { unbankedKb } from "~/modules/run/run/domain/rules.model";
import {
	findActiveSessionRun,
	type RunSettlement,
} from "~/modules/run/run/infrastructure/run.repository";

const NOT_FALLEN = "No run fell there today";

const REFUSALS: Record<LootRefusal, string> = {
	"already-looted": ALREADY_LOOTED,
	"own-run": "You cannot loot your own run",
	"nothing-left": "That run banked everything it was holding",
	"no-run": "Start a run before you take anything into it",
};

export type LootableRun = Pick<
	FallenRow,
	"lootedKb" | "storageKb" | "gate" | "startedAtGate"
>;

export const lootableKbOf = (fallen: LootableRun): number =>
	fallen.lootedKb ??
	unbankedKb(fallen.storageKb, fallen.gate - fallen.startedAtGate, false);

const spoils = async ({
	userId,
	date,
	fallenRunId,
}: {
	userId: string;
	date: string;
	fallenRunId: number;
}): Promise<number> => {
	const fallen = await fetchFallenRun(fallenRunId, date);
	if (!fallen) throw new Error(NOT_FALLEN);

	const run = await findActiveSessionRun(userId);
	const lootKb = lootableKbOf(fallen);
	const refusal = lootRefusalOf(
		{
			ownerId: fallen.userId,
			lootedById: fallen.lootedById,
			lootKb,
		},
		{ id: userId, hasLiveRun: run !== null }
	);
	if (refusal !== null) throw new Error(REFUSALS[refusal]);

	return lootKb;
};

const claiming =
	(userId: string, date: string, fallenRunId: number, kb: number) =>
	(runId: number): RunSettlement =>
	async (tx, before, after) => {
		if (after.storage > before.storage)
			await claimFallenRun(tx, { fallenRunId, looterUserId: userId, kb });
		return settleIncidents(runId, date)(tx, before, after);
	};

export const lootFallenRunService = async (args: {
	userId: string;
	date: string;
	fallenRunId: number;
}): Promise<ApiResponse<RunView>> => {
	const take = await handleApiOperation(() => spoils(args), "lootFallenRun");
	if (!take.success) return take;

	return dispatchRunActionService({
		userId: args.userId,
		date: args.date,
		action: { type: "loot", kb: take.data },
		settle: claiming(args.userId, args.date, args.fallenRunId, take.data),
	});
};

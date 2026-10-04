import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import { settleIncidents } from "~/modules/run/incident/application/incidentSettlement.service";
import { dispatchRunActionService } from "~/modules/run/run/application/run.service";
import type { WireWarmBootPick } from "~/modules/run/run/application/run.validation";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { WarmBoot } from "~/modules/run/run/domain/run.model";
import {
	type WarmBootRefusal,
	warmBootOrderOf,
	warmBootRefusalOf,
} from "~/modules/run/run/domain/warmBoot.model";
import {
	debitArchivedStorage,
	findActiveSessionRun,
	loadRunState,
	type RunSettlement,
} from "~/modules/run/run/infrastructure/run.repository";
import { fetchUnlockedServiceIds } from "~/modules/run/shop/infrastructure/serviceUnlock.repository";

const REFUSALS: Record<WarmBootRefusal, string> = {
	empty: "Pick something to carry, or start without",
	"no-rung": "No such Boot Cache rung",
	locked: "That service is not unlocked yet",
	uncarriable: "That service is never carried in",
	repeated: "A service is carried once",
};
const NO_RUN = "Start a run before you boot it";
const ALREADY_STARTED = "This run has already started";
const ALREADY_BOOTED = "This run already booted";
export const ARCHIVE_SHORT = "The archive cannot cover that";

const NOTHING = 0;

const ordering = async ({
	userId,
	pick,
}: {
	userId: string;
	pick: WireWarmBootPick;
}): Promise<WarmBoot> => {
	const run = await findActiveSessionRun(userId);
	if (!run) throw new Error(NO_RUN);
	const state = await loadRunState(run.id);
	if (state.status !== "configuring") throw new Error(ALREADY_STARTED);
	if (state.warmBoot !== undefined) throw new Error(ALREADY_BOOTED);

	const refusal = warmBootRefusalOf(
		pick,
		await fetchUnlockedServiceIds(userId)
	);
	if (refusal !== null) throw new Error(REFUSALS[refusal]);

	return warmBootOrderOf(pick);
};

const booted = (before: WarmBoot | undefined, after: WarmBoot | undefined) =>
	before === undefined && after !== undefined;

const debiting =
	(userId: string, date: string, bytes: number) =>
	(runId: number): RunSettlement =>
	async (tx, before, after) => {
		if (booted(before.warmBoot, after.warmBoot) && bytes > NOTHING) {
			const left = await debitArchivedStorage(tx, userId, bytes);
			if (left === null) throw new Error(ARCHIVE_SHORT);
		}
		return settleIncidents(runId, date)(tx, before, after);
	};

export const warmBootRunService = async (args: {
	userId: string;
	date: string;
	pick: WireWarmBootPick;
}): Promise<ApiResponse<RunView>> => {
	const order = await handleApiOperation(() => ordering(args), "warmBootRun");
	if (!order.success) return order;

	return dispatchRunActionService({
		userId: args.userId,
		date: args.date,
		action: { type: "warm-boot", ...order.data },
		settle: debiting(args.userId, args.date, order.data.archiveBytes),
	});
};

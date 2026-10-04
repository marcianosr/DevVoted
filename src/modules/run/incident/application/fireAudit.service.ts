import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import type { AttackOffer } from "~/modules/run/incident/domain/incident.model";
import {
	attackerOf,
	offersForAttacker,
} from "~/modules/run/incident/application/attackTargets.service";
import { settleIncidents } from "~/modules/run/incident/application/incidentSettlement.service";
import { insertIncident } from "~/modules/run/incident/infrastructure/incident.repository";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { dispatchRunActionService } from "~/modules/run/run/application/run.service";
import { isPrepPhase } from "~/modules/run/run/domain/run.model";
import {
	findActiveSessionRun,
	loadRunState,
	type RunSettlement,
} from "~/modules/run/run/infrastructure/run.repository";

const NOTHING_HELD = "Nothing to file — buy an incident in the shop first";
const MID_GATE = "File between gates, once this one has closed";
const MOVED_ON = "That rival has moved on — pick again";

const aim = async ({
	userId,
	targetRunId,
}: {
	userId: string;
	targetRunId: number;
}): Promise<AttackOffer> => {
	const run = await findActiveSessionRun(userId);
	if (!run) throw new Error("No active run");
	const state = await loadRunState(run.id);
	if (state.heldAudit === undefined) throw new Error(NOTHING_HELD);
	if (!isPrepPhase(state)) throw new Error(MID_GATE);

	const offers = await offersForAttacker(
		attackerOf(run.id, userId, state, state.heldAudit.auditId)
	);
	const offer = offers.find(
		(candidate) => candidate.targetRunId === targetRunId
	);
	if (offer === undefined) throw new Error(MOVED_ON);
	return offer;
};

const filing =
	(userId: string, date: string, offer: AttackOffer) =>
	(runId: number): RunSettlement =>
	async (tx, before, after) => {
		if (before.heldAudit !== undefined && after.heldAudit === undefined)
			await insertIncident(tx, {
				sentByUserId: userId,
				targetUserId: offer.targetUserId,
				targetRunId: offer.targetRunId,
				targetGate: offer.targetGate,
				auditId: offer.auditId,
			});
		return settleIncidents(runId, date)(tx, before, after);
	};

export const fireAuditService = async (args: {
	userId: string;
	date: string;
	targetRunId: number;
}): Promise<ApiResponse<RunView>> => {
	const aimed = await handleApiOperation(() => aim(args), "fireAudit");
	if (!aimed.success) return aimed;

	return dispatchRunActionService({
		userId: args.userId,
		date: args.date,
		action: { type: "fire-audit" },
		settle: filing(args.userId, args.date, aimed.data),
	});
};

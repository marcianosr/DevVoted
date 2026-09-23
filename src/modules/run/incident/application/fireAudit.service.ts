import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import type { AuditId } from "~/modules/run/gate/domain/audit.model";
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

const NO_ATTACK = "Nothing is armed — clear a gate HEALTHY or better first";
const NOT_PREP = "Aim from prep, once the gate has closed";
const MOVED_ON = "That rival has moved on — pick again";

type Aim = {
	readonly offer: AttackOffer;
	readonly auditId: AuditId;
};

/**
 * The client names a pair; the server deals the offers again and refuses a
 * pair it did not deal. Live rivals move, so a stale pick is refused with a
 * readable reason rather than filed against the wrong gate.
 */
const aim = async ({
	userId,
	date,
	targetRunId,
	auditId,
}: {
	userId: string;
	date: string;
	targetRunId: number;
	auditId: AuditId;
}): Promise<Aim> => {
	const run = await findActiveSessionRun(userId);
	if (!run) throw new Error("No active run");
	const state = await loadRunState(run.id);
	if (state.attack === undefined) throw new Error(NO_ATTACK);
	if (!isPrepPhase(state)) throw new Error(NOT_PREP);

	const offers = await offersForAttacker(
		attackerOf(run.id, userId, state, state.attack),
		date
	);
	const offer = offers.find(
		(candidate) =>
			candidate.targetRunId === targetRunId &&
			candidate.payloads.includes(auditId)
	);
	if (offer === undefined) throw new Error(MOVED_ON);
	return { offer, auditId };
};

/**
 * Files the incident in the same transaction that spends the credit, and only
 * when the reducer actually spent it (ADR-058 D5: the reducer stays pure, the
 * cross-player write sits beside the dispatch).
 */
const filing =
	(userId: string, { offer, auditId }: Aim) =>
	(runId: number): RunSettlement =>
	async (tx, before, after) => {
		if (before.attack !== undefined && after.attack === undefined)
			await insertIncident(tx, {
				sentByUserId: userId,
				targetUserId: offer.targetUserId,
				targetRunId: offer.targetRunId,
				targetGate: offer.targetGate,
				auditId,
			});
		return settleIncidents(runId)(tx, before, after);
	};

export const fireAuditService = async (args: {
	userId: string;
	date: string;
	targetRunId: number;
	auditId: AuditId;
}): Promise<ApiResponse<RunView>> => {
	const aimed = await handleApiOperation(() => aim(args));
	if (!aimed.success) return aimed;

	return dispatchRunActionService({
		userId: args.userId,
		date: args.date,
		action: { type: "fire-audit" },
		settle: filing(args.userId, aimed.data),
	});
};

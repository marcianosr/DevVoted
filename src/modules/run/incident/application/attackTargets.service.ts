import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import {
	type Attacker,
	type AttackOffer,
	eligibleRivals,
	offersFor,
	type QueuedByRun,
	type RivalCandidate,
} from "~/modules/run/incident/domain/incident.model";
import {
	type AttackOfferView,
	attackOfferViewFor,
} from "~/modules/run/incident/application/incident.viewmodel";
import {
	fetchLastTargetUserId,
	fetchQueuedByRun,
	fetchRivalCandidates,
} from "~/modules/run/incident/infrastructure/incident.repository";
import type { HeldAudit, RunState } from "~/modules/run/run/domain/run.model";
import {
	findActiveSessionRun,
	loadRunState,
} from "~/modules/run/run/infrastructure/run.repository";

export type AttackTargetsView = {
	readonly heldAudit: HeldAudit | null;
	readonly offers: readonly AttackOfferView[];
	readonly rivalsForOffer: number | null;
};

const NOTHING_TO_FILE: AttackTargetsView = {
	heldAudit: null,
	offers: [],
	rivalsForOffer: null,
};

export const attackerOf = (
	runId: number,
	userId: string,
	state: Pick<RunState, "gatesCleared">,
	auditId: AuditId
): Attacker => ({
	runId,
	userId,
	gatesCleared: state.gatesCleared,
	auditId,
});

type Field = {
	readonly rivals: readonly RivalCandidate[];
	readonly queued: QueuedByRun;
	readonly lastTargetUserId: string | null;
};

const fieldFor = async (userId: string): Promise<Field> => {
	const [rivals, queued, lastTargetUserId] = await Promise.all([
		fetchRivalCandidates(),
		fetchQueuedByRun(),
		fetchLastTargetUserId(userId),
	]);
	return { rivals, queued, lastTargetUserId };
};

const reachOf = (attacker: Attacker, field: Field): readonly RivalCandidate[] =>
	eligibleRivals(attacker, field.rivals, field.queued, field.lastTargetUserId);

export const offersForAttacker = async (
	attacker: Attacker
): Promise<readonly AttackOffer[]> =>
	offersFor(attacker, reachOf(attacker, await fieldFor(attacker.userId)));

export const getAttackTargetsService = async ({
	userId,
}: {
	userId: string;
}): Promise<ApiResponse<AttackTargetsView>> =>
	handleApiOperation(async () => {
		const run = await findActiveSessionRun(userId);
		if (!run) return NOTHING_TO_FILE;

		const state = await loadRunState(run.id);
		const held = state.heldAudit;
		const offered = state.incidentOffer;
		if (held === undefined && offered === undefined) return NOTHING_TO_FILE;

		const field = await fieldFor(userId);
		const reach = (auditId: AuditId) =>
			reachOf(attackerOf(run.id, userId, state, auditId), field);

		return {
			heldAudit: held ?? null,
			offers:
				held === undefined
					? []
					: offersFor(
							attackerOf(run.id, userId, state, held.auditId),
							reach(held.auditId)
						).map(attackOfferViewFor),
			rivalsForOffer: offered === undefined ? null : reach(offered).length,
		};
	}, "getAttackTargets");

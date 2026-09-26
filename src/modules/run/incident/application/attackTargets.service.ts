import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import {
	type Attacker,
	type AttackOffer,
	eligibleRivals,
	offersFor,
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
};

const NOTHING_ARMED: AttackTargetsView = { heldAudit: null, offers: [] };

export const attackerOf = (
	runId: number,
	userId: string,
	state: RunState,
	heldAudit: HeldAudit
): Attacker => ({
	runId,
	userId,
	gatesCleared: state.gatesCleared,
	band: heldAudit.band,
});

/** The live field, filtered and dealt. Shared with the fire, which re-derives it. */
export const offersForAttacker = async (
	attacker: Attacker,
	date: string
): Promise<readonly AttackOffer[]> => {
	const [rivals, queued, lastTargetUserId] = await Promise.all([
		fetchRivalCandidates(),
		fetchQueuedByRun(),
		fetchLastTargetUserId(attacker.userId),
	]);
	return offersFor(
		attacker,
		eligibleRivals(attacker, rivals, queued, lastTargetUserId),
		queued,
		date
	);
};

/** Reads no rival at all while nothing is armed: the panel then has nothing to offer. */
export const getAttackTargetsService = async ({
	userId,
	date,
}: {
	userId: string;
	date: string;
}): Promise<ApiResponse<AttackTargetsView>> =>
	handleApiOperation(async () => {
		const run = await findActiveSessionRun(userId);
		if (!run) return NOTHING_ARMED;

		const state = await loadRunState(run.id);
		if (state.heldAudit === undefined) return NOTHING_ARMED;

		const offers = await offersForAttacker(
			attackerOf(run.id, userId, state, state.heldAudit),
			date
		);
		return {
			heldAudit: state.heldAudit,
			offers: offers.map(attackOfferViewFor),
		};
	}, "getAttackTargets");

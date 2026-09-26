import { lockIncidents } from "~/modules/run/incident/domain/incident.model";
import {
	carryIncidentsForward,
	endIncidentsForRun,
	fetchQueuedIncidents,
	markIncidents,
	markSurvived,
} from "~/modules/run/incident/infrastructure/incident.repository";
import {
	isRunOver,
	type RunState,
	withLockedGate,
} from "~/modules/run/run/domain/run.model";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";
import type {
	RunSettlement,
	RunTx,
} from "~/modules/run/run/infrastructure/run.repository";

const lockGateInFront = async (
	tx: RunTx,
	runId: number,
	after: RunState
): Promise<RunState> => {
	const gate = after.gatesCleared;
	if (gate > VICTORY_GATE) return after;

	const outcome = lockIncidents(
		gate,
		await fetchQueuedIncidents(tx, runId, gate)
	);
	await markIncidents(
		tx,
		outcome.locked.map((incident) => incident.id),
		"locked"
	);
	await carryIncidentsForward(
		tx,
		outcome.carried.map((incident) => incident.id)
	);
	await markIncidents(
		tx,
		outcome.lapsed.map((incident) => incident.id),
		"lapsed"
	);
	return withLockedGate(after, gate, outcome.locked);
};

export const settleIncidents =
	(runId: number): RunSettlement =>
	async (tx, before, after) => {
		const cleared = after.gatesCleared > before.gatesCleared;
		if (cleared) await markSurvived(tx, runId, before.gatesCleared);
		const settled = cleared ? await lockGateInFront(tx, runId, after) : after;

		if (isRunOver(after.status) && !isRunOver(before.status))
			await endIncidentsForRun(runId, tx);

		return settled;
	};

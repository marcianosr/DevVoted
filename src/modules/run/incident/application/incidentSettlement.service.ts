import { lockIncidents } from "~/modules/run/incident/domain/incident.model";
import {
	carryIncidentsForward,
	endIncidentsForRun,
	fetchQueuedIncidents,
	markIncidents,
	markSurvived,
} from "~/modules/run/incident/infrastructure/incident.repository";
import {
	incidentsAt,
	isPrepPhase,
	isRunOver,
	type RunState,
	scheduleOf,
	withGateAudits,
} from "~/modules/run/run/domain/run.model";
import { gateAuditsFor } from "~/modules/run/gate/domain/auditSchedule.model";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";
import type {
	RunSettlement,
	RunTx,
} from "~/modules/run/run/infrastructure/run.repository";

const lockGateInFront = async (
	tx: RunTx,
	runId: number,
	date: string,
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
	return withGateAudits(after, gate, date, outcome.locked);
};

const backfillGateAudits = (state: RunState, date: string): RunState => {
	const gate = state.gatesCleared;

	if (gate > VICTORY_GATE) return state;
	if (!isPrepPhase(state)) return state;
	if (scheduleOf(state)[gate] !== undefined) return state;

	return {
		...state,
		auditSchedule: {
			...scheduleOf(state),
			[gate]: gateAuditsFor(
				gate,
				date,
				incidentsAt(state, gate).map((incident) => incident.auditId)
			),
		},
	};
};

export const settleIncidents =
	(runId: number, date: string): RunSettlement =>
	async (tx, before, after) => {
		const cleared = after.gatesCleared > before.gatesCleared;
		if (cleared) await markSurvived(tx, runId, before.gatesCleared);
		const settled = cleared
			? await lockGateInFront(tx, runId, date, after)
			: backfillGateAudits(after, date);

		if (isRunOver(after.status) && !isRunOver(before.status))
			await endIncidentsForRun(runId, tx);

		return settled;
	};

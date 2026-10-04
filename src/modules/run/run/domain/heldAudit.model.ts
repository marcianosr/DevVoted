import {
	type AuditId,
	auditLabelOf,
} from "~/modules/run/gate/domain/audit.model";
import {
	drawPayloads,
	FIRST_AUDITED_GATE,
	poolForGate,
} from "~/modules/run/gate/domain/auditSchedule.model";
import { canFireFrom } from "~/modules/run/incident/domain/incident.model";
import {
	INCIDENT_KB,
	INCIDENT_OFFER_ONE_IN,
	INCIDENT_REFRESH_COST_KB,
} from "~/modules/run/run/domain/rules.model";
import { type RunState, withLog } from "~/modules/run/run/domain/run.model";
import { oneInSeeded } from "~/shared/lib/seededRandom";

export const landingGateFor = (gatesCleared: number): number =>
	Math.max(gatesCleared + 1, FIRST_AUDITED_GATE);

export const landingPoolFor = (gatesCleared: number): readonly AuditId[] =>
	poolForGate(landingGateFor(gatesCleared));

export const incidentRefreshCost = (refreshes: number): number =>
	INCIDENT_REFRESH_COST_KB[refreshes] ??
	INCIDENT_REFRESH_COST_KB[INCIDENT_REFRESH_COST_KB.length - 1];

export const deskOpenAt = (gatesCleared: number): boolean =>
	canFireFrom({ gatesCleared });

const incidentSeed = (
	windowPollId: string,
	gatesCleared: number,
	refreshes: number
): string => `incident:${windowPollId}:${gatesCleared}:${refreshes}`;

const windowPollIdOf = (
	state: Pick<RunState, "polls">,
	index: number
): string => state.polls[index]?.id ?? "";

const dealt = (
	gatesCleared: number,
	seed: string,
	spent: readonly AuditId[]
): AuditId | undefined =>
	drawPayloads(
		landingPoolFor(gatesCleared).filter((id) => !spent.includes(id)),
		[],
		seed,
		1
	)[0];

export const dealIncidentOffer = (
	state: RunState,
	gatesCleared: number,
	windowIndex: number
): RunState => {
	const seed = incidentSeed(
		windowPollIdOf(state, windowIndex),
		gatesCleared,
		0
	);
	const offer =
		deskOpenAt(gatesCleared) && oneInSeeded(INCIDENT_OFFER_ONE_IN, seed)
			? dealt(gatesCleared, seed, [])
			: undefined;
	return {
		...state,
		incidentOffer: offer,
		incidentRefreshes: undefined,
		incidentWindowIndex: windowIndex,
	};
};

export const canBuyIncident = (state: RunState): boolean =>
	state.incidentOffer !== undefined && state.storage >= INCIDENT_KB;

export const buyIncident = (state: RunState): RunState => {
	const offer = state.incidentOffer;
	if (offer === undefined || !canBuyIncident(state)) return state;
	return {
		...state,
		storage: state.storage - INCIDENT_KB,
		heldAudit: { auditId: offer },
		incidentOffer: undefined,
		log: withLog(state, `Bought ${auditLabelOf(offer)} (-${INCIDENT_KB}KB).`),
	};
};

export const canRefreshIncident = (state: RunState): boolean =>
	state.incidentOffer !== undefined &&
	state.storage >= incidentRefreshCost(state.incidentRefreshes ?? 0);

export const refreshIncident = (state: RunState): RunState => {
	const offer = state.incidentOffer;
	if (offer === undefined || !canRefreshIncident(state)) return state;
	const refreshes = state.incidentRefreshes ?? 0;
	const next = dealt(
		state.gatesCleared,
		incidentSeed(
			windowPollIdOf(state, state.incidentWindowIndex ?? 0),
			state.gatesCleared,
			refreshes + 1
		),
		[offer]
	);
	if (next === undefined) return state;
	const cost = incidentRefreshCost(refreshes);
	return {
		...state,
		storage: state.storage - cost,
		incidentOffer: next,
		incidentRefreshes: refreshes + 1,
		log: withLog(state, `Refreshed the incident (-${cost}KB).`),
	};
};

export const fireAudit = (state: RunState): RunState =>
	state.heldAudit === undefined ? state : { ...state, heldAudit: undefined };

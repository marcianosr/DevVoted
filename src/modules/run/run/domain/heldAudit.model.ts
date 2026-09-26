import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import {
	drawPayloads,
	FIRST_AUDITED_GATE,
	poolForGate,
} from "~/modules/run/gate/domain/auditSchedule.model";
import { REPACKAGE_KB } from "~/modules/run/run/domain/rules.model";
import {
	type HeldAudit,
	type HeldAuditBand,
	type KeptAudit,
	type RunState,
	withLog,
} from "~/modules/run/run/domain/run.model";

const PAYLOADS_BY_BAND = { ok: 2, healthy: 1, perfect: 1 } satisfies Record<
	HeldAuditBand,
	number
>;

export const isHeldAuditBand = (band: CoverageBandId): band is HeldAuditBand =>
	band in PAYLOADS_BY_BAND;

export const payloadCountFor = (band: HeldAuditBand): number =>
	PAYLOADS_BY_BAND[band];

export const isSealed = (audit: HeldAudit): boolean =>
	audit.choices === undefined && audit.payload === undefined;

export const isOpened = (audit: HeldAudit): boolean => !isSealed(audit);

export const isKept = (audit: HeldAudit): audit is KeptAudit =>
	audit.payload !== undefined;

export type HandedAudit = Partial<
	Pick<RunState, "heldAudit" | "offeredAudit" | "auditHandedAtGate">
>;

export const handAudit = (
	state: Pick<RunState, "heldAudit">,
	band: CoverageBandId,
	gate: number
): HandedAudit => {
	if (!isHeldAuditBand(band)) return {};
	const handed: HeldAudit = { band, gate };
	return state.heldAudit === undefined
		? { heldAudit: handed, auditHandedAtGate: gate }
		: { offeredAudit: handed, auditHandedAtGate: gate };
};

export const landingGateFor = (gatesCleared: number): number =>
	Math.max(gatesCleared + 1, FIRST_AUDITED_GATE);

export const landingPoolFor = (gatesCleared: number): readonly AuditId[] =>
	poolForGate(landingGateFor(gatesCleared));

const openSeed = (seed: string, state: RunState, held: HeldAudit): string =>
	`${seed}:${state.gatesCleared}:${held.gate}:open`;

const repackageSeed = (seed: string, state: RunState): string =>
	`${seed}:${state.gatesCleared}:repackage`;

const opened = (held: HeldAudit, drawn: readonly AuditId[]): HeldAudit => {
	const [first, ...rest] = drawn;
	if (first === undefined) return held;
	if (rest.length === 0)
		return { band: held.band, gate: held.gate, payload: first };
	return { band: held.band, gate: held.gate, choices: drawn };
};

export const openAudit = (state: RunState, seed: string): RunState => {
	const held = state.heldAudit;
	if (held === undefined || isOpened(held)) return state;
	const drawn = drawPayloads(
		landingPoolFor(state.gatesCleared),
		[],
		openSeed(seed, state, held),
		payloadCountFor(held.band)
	);
	return { ...state, heldAudit: opened(held, drawn) };
};

export const keepPayload = (state: RunState, auditId: AuditId): RunState => {
	const held = state.heldAudit;
	if (held?.choices === undefined || !held.choices.includes(auditId))
		return state;
	return {
		...state,
		heldAudit: { band: held.band, gate: held.gate, payload: auditId },
	};
};

export const takeAudit = (state: RunState): RunState =>
	state.offeredAudit === undefined
		? state
		: { ...state, heldAudit: state.offeredAudit, offeredAudit: undefined };

const inHand = (held: HeldAudit): readonly AuditId[] =>
	held.payload === undefined ? (held.choices ?? []) : [held.payload];

export const repackageAvailable = (state: RunState): boolean =>
	state.heldAudit !== undefined && isOpened(state.heldAudit);

export const canRepackage = (state: RunState): boolean =>
	repackageAvailable(state) &&
	state.repackagedThisShop !== true &&
	state.storage >= REPACKAGE_KB;

export const repackage = (state: RunState, seed: string): RunState => {
	const held = state.heldAudit;
	if (held === undefined || !canRepackage(state)) return state;
	const current = inHand(held);
	const drawn = drawPayloads(
		landingPoolFor(state.gatesCleared).filter((id) => !current.includes(id)),
		[],
		repackageSeed(seed, state),
		payloadCountFor(held.band)
	);
	return {
		...state,
		storage: state.storage - REPACKAGE_KB,
		repackagedThisShop: true,
		heldAudit: opened(held, drawn),
		log: withLog(state, `Repackaged the audit (-${REPACKAGE_KB}KB).`),
	};
};

export const fireAudit = (state: RunState): RunState =>
	state.heldAudit === undefined || !isKept(state.heldAudit)
		? state
		: { ...state, heldAudit: state.offeredAudit, offeredAudit: undefined };

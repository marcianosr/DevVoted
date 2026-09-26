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

/** A thin clear opens the most: rubber-banding lives in the choice, never in the count. */
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

/**
 * Every clear hands one sealed audit (ADR-119). A held one is never displaced
 * by the clear itself: the second is offered for the shop visit, where the
 * player fires, takes or leaves it.
 */
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

/**
 * The lowest gate a held payload can land on: rivals stand at your gate or
 * ahead, and nothing lands before the first audited gate.
 */
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

/** Sealed → opened. The server names the seed; a refresh never re-rolls it. */
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

/** An OK audit opened two; keeping one settles it. */
export const keepPayload = (state: RunState, auditId: AuditId): RunState => {
	const held = state.heldAudit;
	if (held?.choices === undefined || !held.choices.includes(auditId))
		return state;
	return {
		...state,
		heldAudit: { band: held.band, gate: held.gate, payload: auditId },
	};
};

/** The offered audit replaces the held one, opened or not. */
export const takeAudit = (state: RunState): RunState =>
	state.offeredAudit === undefined
		? state
		: { ...state, heldAudit: state.offeredAudit, offeredAudit: undefined };

const inHand = (held: HeldAudit): readonly AuditId[] =>
	held.payload === undefined ? (held.choices ?? []) : [held.payload];

/** Whether the shop sells a repackage at all: an opened audit is in hand. */
export const repackageAvailable = (state: RunState): boolean =>
	state.heldAudit !== undefined && isOpened(state.heldAudit);

export const canRepackage = (state: RunState): boolean =>
	repackageAvailable(state) &&
	state.repackagedThisShop !== true &&
	state.storage >= REPACKAGE_KB;

/**
 * A reroll, never a sale: the band's count again, minus what is already in
 * hand. The pool is narrowed by hand rather than through `drawPayloads`'s
 * `taken`, which would also bar the whole family of what was held.
 */
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

/**
 * The reducer only spends the payload; the service files the incident
 * (ADR-058 D5). An offered audit, if any, slides into the hand still sealed.
 */
export const fireAudit = (state: RunState): RunState =>
	state.heldAudit === undefined || !isKept(state.heldAudit)
		? state
		: { ...state, heldAudit: state.offeredAudit, offeredAudit: undefined };

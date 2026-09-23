import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import {
	type Attack,
	type AttackBand,
	isPrepPhase,
	type RunState,
} from "~/modules/run/run/domain/run.model";

const PAYLOADS_BY_BAND = { healthy: 1, perfect: 2 } satisfies Record<
	AttackBand,
	number
>;

export const isAttackBand = (band: CoverageBandId): band is AttackBand =>
	band in PAYLOADS_BY_BAND;

export const payloadCountFor = (band: AttackBand): number =>
	PAYLOADS_BY_BAND[band];

/**
 * A clear arms at most one attack, and a later clear can only make it better:
 * strong players would otherwise stockpile ammunition, and a thin day should
 * never cost a rival the shot they already earned.
 */
export const armAttack = (
	held: Attack | undefined,
	band: CoverageBandId
): Attack | undefined => {
	if (!isAttackBand(band)) return held;
	if (held === undefined) return { band };
	return payloadCountFor(band) > payloadCountFor(held.band) ? { band } : held;
};

/** The reducer only spends the credit; the service files the incident (ADR-058 D5). */
export const fireAudit = (state: RunState): RunState =>
	state.attack === undefined || !isPrepPhase(state)
		? state
		: { ...state, attack: undefined };

import {
	auditExtraStrips,
	auditsForGate,
} from "~/modules/run/gate/domain/audit.model";
import {
	ALL_SWATCHES,
	type GateSwatch,
} from "~/modules/run/gate/domain/swatch.model";
import { SLOT_UNLOCKS } from "~/modules/run/pipeline/domain/pipeline.model";
import {
	coverageDemandFor,
	failStripsFor,
	PIN_FROM_GATE,
	STORAGE_PLANS,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import {
	EXTEND_FROM_GATE,
	LOCK_FROM_GATE,
} from "~/modules/run/shop/domain/draft.model";

/**
 * The gate ladder read as a collection instead of as a run: thirteen rows, each
 * naming what one gate demands and what clearing it opens.
 *
 * There is no gate-progress table, and none is needed: `users.owned_swatch_ids`
 * gains a swatch id exactly when its gate falls (ADR-019), so swatch ownership
 * already *is* the account-level record of every gate ever cleared.
 */
export type GatedexState = "cleared" | "next" | "locked";

export type GateAction = "lock" | "extend" | "pin";

/**
 * What clearing a gate opens, as data rather than as a label. The wording is the
 * Dex's own — a domain that owned "slot 4" could not be read by a second surface
 * that says it differently.
 */
export type GateUnlock =
	| { readonly kind: "slot"; readonly slot: number }
	| { readonly kind: "plan"; readonly capKb: number }
	| { readonly kind: "action"; readonly action: GateAction };

export type GatedexEntry = {
	readonly gate: number;
	readonly swatch: GateSwatch;
	readonly coverageDemand: number;
	readonly peels: number;
	/** True where an audit inflates the peel row above the gate's own quota. */
	readonly peelsAudited: boolean;
	readonly audits: readonly string[];
	readonly unlocks: readonly GateUnlock[];
	readonly winsTheRun: boolean;
	readonly state: GatedexState;
};

/**
 * The gate you clear to earn a grant whose threshold is stated as a `gatesCleared`
 * floor. The run's two staging conventions disagree by one and both are correct:
 * `SLOT_UNLOCKS.gate` names the gate itself (`gatesCleared > gate`), while every
 * `*_FROM_GATE` constant is a floor (`gatesCleared >= from`), and `gatesCleared`
 * reaches N the moment gate N-1 falls. Converting once here is what keeps the
 * ladder from listing lock, extend and every storage plan a row too late.
 */
const grantedByClearing = (gatesClearedFloor: number): number =>
	gatesClearedFloor - 1;

const ACTION_UNLOCKS = [
	{ action: "lock", fromGate: LOCK_FROM_GATE },
	{ action: "extend", fromGate: EXTEND_FROM_GATE },
	{ action: "pin", fromGate: PIN_FROM_GATE },
] as const satisfies readonly { action: GateAction; fromGate: number }[];

const slotsOpenedBy = (gate: number): readonly GateUnlock[] =>
	SLOT_UNLOCKS.filter((unlock) => unlock.gate === gate).map((unlock) => ({
		kind: "slot",
		slot: unlock.slot,
	}));

// The two plans on offer from the first shop have no gate to hang off, and
// grantedByClearing lands them on gate -1 rather than needing a case here.
const plansOpenedBy = (gate: number): readonly GateUnlock[] =>
	STORAGE_PLANS.filter((plan) => grantedByClearing(plan.fromGate) === gate).map(
		(plan) => ({ kind: "plan", capKb: plan.capKb })
	);

const actionsOpenedBy = (gate: number): readonly GateUnlock[] =>
	ACTION_UNLOCKS.filter(
		(unlock) => grantedByClearing(unlock.fromGate) === gate
	).map((unlock) => ({ kind: "action", action: unlock.action }));

const unlocksOpenedBy = (gate: number): readonly GateUnlock[] => [
	...slotsOpenedBy(gate),
	...plansOpenedBy(gate),
	...actionsOpenedBy(gate),
];

const stateOf = (
	swatch: GateSwatch,
	ownedSwatchIds: readonly string[],
	nextGate: number | undefined
): GatedexState => {
	if (ownedSwatchIds.includes(swatch.id)) return "cleared";
	return swatch.gate === nextGate ? "next" : "locked";
};

/**
 * The lowest gate not yet cleared, or undefined once every swatch is in hand.
 * Read off the ladder rather than counted, so a gap left by an id that never
 * landed points at the gap instead of silently shifting every row below it.
 */
const nextGateFor = (ownedSwatchIds: readonly string[]): number | undefined =>
	ALL_SWATCHES.find((swatch) => !ownedSwatchIds.includes(swatch.id))?.gate;

export const gatedex = (
	ownedSwatchIds: readonly string[]
): readonly GatedexEntry[] => {
	const nextGate = nextGateFor(ownedSwatchIds);

	return ALL_SWATCHES.map((swatch) => {
		const audits = auditsForGate(swatch.gate);
		const extraPeels = auditExtraStrips(audits);

		return {
			gate: swatch.gate,
			swatch,
			coverageDemand: coverageDemandFor(swatch.gate),
			peels: failStripsFor(swatch.gate) + extraPeels,
			peelsAudited: extraPeels > 0,
			audits: audits.map((audit) => audit.name),
			unlocks: unlocksOpenedBy(swatch.gate),
			winsTheRun: swatch.gate === VICTORY_GATE,
			state: stateOf(swatch, ownedSwatchIds, nextGate),
		};
	});
};

export const gatesClearedIn = (entries: readonly GatedexEntry[]): number =>
	entries.filter((entry) => entry.state === "cleared").length;

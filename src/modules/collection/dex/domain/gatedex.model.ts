import {
	auditExtraPeelShare,
	auditsForGate,
} from "~/modules/run/gate/domain/audit.model";
import {
	ALL_SWATCHES,
	type GateSwatch,
} from "~/modules/run/gate/domain/swatch.model";
import {
	coverageDemandFor,
	failPeelShareFor,
	PIN_FROM_GATE,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import {
	EXTEND_FROM_GATE,
	LOCK_FROM_GATE,
} from "~/modules/run/shop/domain/draft.model";

export type GatedexState = "cleared" | "next" | "locked";

export type GateAction = "lock" | "extend" | "pin";

export type GateUnlock = {
	readonly kind: "action";
	readonly action: GateAction;
};

export type GatedexEntry = {
	readonly gate: number;
	readonly swatch: GateSwatch;
	readonly coverageDemand: number;
	readonly peelShare: number;
	readonly peelsAudited: boolean;
	readonly audits: readonly string[];
	readonly unlocks: readonly GateUnlock[];
	readonly winsTheRun: boolean;
	readonly state: GatedexState;
};

const grantedByClearing = (gatesClearedFloor: number): number =>
	gatesClearedFloor - 1;

const ACTION_UNLOCKS = [
	{ action: "lock", fromGate: LOCK_FROM_GATE },
	{ action: "extend", fromGate: EXTEND_FROM_GATE },
	{ action: "pin", fromGate: PIN_FROM_GATE },
] as const satisfies readonly { action: GateAction; fromGate: number }[];

const actionsOpenedBy = (gate: number): readonly GateUnlock[] =>
	ACTION_UNLOCKS.filter(
		(unlock) => grantedByClearing(unlock.fromGate) === gate
	).map((unlock) => ({ kind: "action", action: unlock.action }));

const unlocksOpenedBy = (gate: number): readonly GateUnlock[] =>
	actionsOpenedBy(gate);

const stateOf = (
	swatch: GateSwatch,
	ownedSwatchIds: readonly string[],
	nextGate: number | undefined
): GatedexState => {
	if (ownedSwatchIds.includes(swatch.id)) return "cleared";
	return swatch.gate === nextGate ? "next" : "locked";
};

const nextGateFor = (ownedSwatchIds: readonly string[]): number | undefined =>
	ALL_SWATCHES.find((swatch) => !ownedSwatchIds.includes(swatch.id))?.gate;

export const gatedex = (
	ownedSwatchIds: readonly string[]
): readonly GatedexEntry[] => {
	const nextGate = nextGateFor(ownedSwatchIds);

	return ALL_SWATCHES.map((swatch) => {
		const audits = auditsForGate(swatch.gate);
		const extraPeelShare = auditExtraPeelShare(audits);

		return {
			gate: swatch.gate,
			swatch,
			coverageDemand: coverageDemandFor(swatch.gate),
			peelShare: failPeelShareFor(swatch.gate) + extraPeelShare,
			peelsAudited: extraPeelShare > 0,
			audits: audits.map((audit) => audit.name),
			unlocks: unlocksOpenedBy(swatch.gate),
			winsTheRun: swatch.gate === VICTORY_GATE,
			state: stateOf(swatch, ownedSwatchIds, nextGate),
		};
	});
};

export const gatesClearedIn = (entries: readonly GatedexEntry[]): number =>
	entries.filter((entry) => entry.state === "cleared").length;

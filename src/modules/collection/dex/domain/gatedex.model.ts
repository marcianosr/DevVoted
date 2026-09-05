import {
	auditAt,
	auditExtraPeelShare,
	auditLabel,
	auditLabelOf,
} from "~/modules/run/gate/domain/audit.model";
import {
	bandForGate,
	certainAuditsFor,
} from "~/modules/run/gate/domain/auditSchedule.model";
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
import { EXTEND_FROM_GATE } from "~/modules/run/shop/domain/draft.model";

export type GatedexState = "cleared" | "next" | "locked";

export type GateAction = "extend" | "pin";

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
	readonly auditPool: readonly string[];
	readonly auditDraw: number;
	readonly unlocks: readonly GateUnlock[];
	readonly winsTheRun: boolean;
	readonly state: GatedexState;
};

const grantedByClearing = (gatesClearedFloor: number): number =>
	gatesClearedFloor - 1;

const ACTION_UNLOCKS = [
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
		const certain = certainAuditsFor(swatch.gate);
		const audits = certain.map((id) => auditAt(id, swatch.gate));
		const extraPeelShare = auditExtraPeelShare(audits);
		const band = bandForGate(swatch.gate);

		return {
			gate: swatch.gate,
			swatch,
			coverageDemand: coverageDemandFor(swatch.gate),
			peelShare: failPeelShareFor(swatch.gate) + extraPeelShare,
			peelsAudited: extraPeelShare > 0,
			audits: audits.map(auditLabel),
			auditPool: (band?.pool ?? []).map((id) => auditLabelOf(id, swatch.gate)),
			auditDraw: band?.perGate ?? 0,
			unlocks: unlocksOpenedBy(swatch.gate),
			winsTheRun: swatch.gate === VICTORY_GATE,
			state: stateOf(swatch, ownedSwatchIds, nextGate),
		};
	});
};

export const gatesClearedIn = (entries: readonly GatedexEntry[]): number =>
	entries.filter((entry) => entry.state === "cleared").length;

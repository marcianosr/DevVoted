import { auditLabelOf } from "~/modules/run/gate/domain/audit.model";
import {
	auditCapacityFor,
	poolForGate,
} from "~/modules/run/gate/domain/auditSchedule.model";
import {
	ALL_SWATCHES,
	type GateSwatch,
} from "~/modules/run/gate/domain/swatch.model";
import {
	failPeelShareFor,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import {
	isSoldInShop,
	openingGateOf,
	REGISTRY_CONTROL_LIST,
	type RegistryControlId,
} from "~/modules/run/shop/domain/registryControl.model";
import {
	healthyAt,
	percentOf,
} from "~/modules/run/build/domain/coverageRatio.model";

export type GatedexState = "cleared" | "next" | "locked";

export type GateAction = RegistryControlId;

export type GateUnlock = {
	readonly kind: "action";
	readonly action: GateAction;
};

export type GatedexEntry = {
	readonly gate: number;
	readonly swatch: GateSwatch;
	readonly coverageDemand: number;
	readonly peelShare: number;
	/** What a rival can throw at this gate, and how many at most (ADR-099). */
	readonly auditPool: readonly string[];
	readonly auditCapacity: number;
	readonly unlocks: readonly GateUnlock[];
	readonly winsTheRun: boolean;
	readonly state: GatedexState;
};

const actionsOpenedBy = (gate: number): readonly GateUnlock[] =>
	REGISTRY_CONTROL_LIST.filter(isSoldInShop)
		.filter((control) => openingGateOf(control) === gate)
		.map((control) => ({ kind: "action", action: control.id }));

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

	return ALL_SWATCHES.map((swatch) => ({
		gate: swatch.gate,
		swatch,
		coverageDemand: percentOf(healthyAt(swatch.gate)),
		peelShare: failPeelShareFor(swatch.gate),
		auditPool: poolForGate(swatch.gate).map((id) =>
			auditLabelOf(id, swatch.gate)
		),
		auditCapacity: auditCapacityFor(swatch.gate),
		unlocks: actionsOpenedBy(swatch.gate),
		winsTheRun: swatch.gate === VICTORY_GATE,
		state: stateOf(swatch, ownedSwatchIds, nextGate),
	}));
};

export const gatesClearedIn = (entries: readonly GatedexEntry[]): number =>
	entries.filter((entry) => entry.state === "cleared").length;

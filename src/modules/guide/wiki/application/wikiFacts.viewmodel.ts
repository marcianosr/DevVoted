import { CONFIG_GROUP_LABELS } from "~/modules/run/build/application/newRunScreen.viewmodel";
import {
	floorAt,
	healthyAt,
	healthyUnitsAt,
	okAt,
	scoringSlotsAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	CONFIG_SIZES,
	DRAFT_COST_PER_SLOT_KB,
} from "~/modules/run/config/domain/config.model";
import {
	CONFIG_GROUP_ORDER,
	configGroupOf,
} from "~/modules/run/config/domain/configGroup.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { FREE_CONFIG_IDS } from "~/modules/run/config/domain/configUnlock.model";
import { STARTER_POOL } from "~/modules/run/config/domain/hand.model";
import {
	AUDIT_TIERS,
	auditCapacityFor,
	tierForGate,
} from "~/modules/run/gate/domain/auditSchedule.model";
import { GATE_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import {
	GATE_COUNT,
	GATE_REWARD_KB,
	VICTORY_GATE,
	failPeelShareFor,
	gateRewardMultiplier,
} from "~/modules/run/run/domain/rules.model";
import { EXTEND_FROM_GATE } from "~/modules/run/shop/domain/draft.model";

export const POOL_LETTERS = ["A", "B", "C"] as const;

export type PoolLetter = (typeof POOL_LETTERS)[number];

export const GATE_UNLOCK = {
	shop: "Shop",
	rebuild: "Rebuild",
	extend: "Extend",
	summit: "Clearing it on HEALTHY or better wins the run",
} as const;

export type GateFacts = {
	readonly gate: number;
	readonly place: string;
	readonly scoringSlots: number;
	readonly floorShare: number;
	readonly okShare: number;
	readonly healthyShare: number;
	readonly healthyUnits: number;
	readonly clearPaysKb: number;
	readonly missPeelShare: number;
	readonly auditCount: number;
	readonly auditPool: PoolLetter | undefined;
	readonly unlocks: readonly string[];
};

const GATES = Array.from({ length: GATE_COUNT }, (_, gate) => gate);

const unlocksAt = (gate: number): readonly string[] =>
	[
		gate === 0 ? GATE_UNLOCK.shop : undefined,
		gate === 0 ? GATE_UNLOCK.rebuild : undefined,
		gate === EXTEND_FROM_GATE ? GATE_UNLOCK.extend : undefined,
		gate === VICTORY_GATE ? GATE_UNLOCK.summit : undefined,
	].filter((unlock) => unlock !== undefined);

const poolAt = (gate: number): PoolLetter | undefined => {
	const tier = tierForGate(gate);
	return tier === undefined
		? undefined
		: POOL_LETTERS[AUDIT_TIERS.indexOf(tier)];
};

const gateFactsAt = (gate: number): GateFacts => ({
	gate,
	place: GATE_SWATCHES[gate].gateName,
	scoringSlots: scoringSlotsAt(gate),
	floorShare: floorAt(gate),
	okShare: okAt(gate),
	healthyShare: healthyAt(gate),
	healthyUnits: healthyUnitsAt(gate),
	clearPaysKb: GATE_REWARD_KB * gateRewardMultiplier(gate),
	missPeelShare: failPeelShareFor(gate),
	auditCount: auditCapacityFor(gate),
	auditPool: poolAt(gate),
	unlocks: unlocksAt(gate),
});

export const GATE_FACTS: readonly GateFacts[] = GATES.map(gateFactsAt);

export type ConfigSizeFacts = {
	readonly slots: number;
	readonly priceKb: number;
};

export const CONFIG_SIZE_FACTS: readonly ConfigSizeFacts[] = CONFIG_SIZES.map(
	(slots) => ({ slots, priceKb: DRAFT_COST_PER_SLOT_KB * slots })
);

export const CONFIG_COUNTS = {
	total: CONFIG_LIST.length,
	free: FREE_CONFIG_IDS.length,
	earned: CONFIG_LIST.length - FREE_CONFIG_IDS.length,
} as const;

export type ConfigGroupFacts = {
	readonly label: string;
	readonly count: number;
};

export const CONFIG_GROUP_FACTS: readonly ConfigGroupFacts[] =
	CONFIG_GROUP_ORDER.map((group) => ({
		label: CONFIG_GROUP_LABELS[group],
		count: CONFIG_LIST.filter((config) => configGroupOf(config) === group)
			.length,
	}));

export const STARTER_LABELS: readonly string[] = STARTER_POOL.map(
	(config) => config.label
);

export const trimmed = (value: number): string =>
	Number.isInteger(value) ? `${value}` : value.toFixed(1);

const PERCENT_PRECISION = 10;

export const percentLabel = (share: number): string =>
	`${trimmed(Math.round(share * 100 * PERCENT_PRECISION) / PERCENT_PRECISION)}%`;

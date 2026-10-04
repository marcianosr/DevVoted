import {
	countsReader,
	type ObjectiveCount,
	type ObjectiveMetric,
	type ThematicObjective,
} from "~/modules/run/config/domain/configUnlock.model";
import {
	BOOT_CACHE_BANK_KB,
	BOOT_CACHE_RUNGS,
	type BootCacheRung,
	EXTEND_CARRY_BYTES,
	PIN_CARRY_BYTES,
	PIN_FROM_GATE,
	PIN_UNTIL_GATE,
	SKIP_SHOP_KB,
	pinCostFor,
} from "~/modules/run/run/domain/rules.model";
import {
	EXTEND_COST_KB,
	EXTEND_FROM_GATE,
	rebuildCost,
} from "~/modules/run/shop/domain/draft.model";
import { kbLabel } from "~/shared/lib/storage";

export type RegistryControlId =
	| "rebuild"
	| "skipShop"
	| "extend"
	| "hotReload"
	| "returnPolicy"
	| "abandon"
	| "pin"
	| "bootCache"
	| "dockerImage";

export type ServiceUnlock =
	| { readonly kind: "starter" }
	| { readonly kind: "earned"; readonly objective: ThematicObjective };

export type ServiceSale =
	| {
			readonly soldIn: "shop";
			readonly opensAfterGates: number;
			readonly closesAfterGates?: number;
	  }
	| { readonly soldIn: "archive" };

export type ServiceLasts =
	"visit" | "run" | "endsRun" | "nextRun" | "atStart" | "firstShop";

export type ServicePrice =
	| { readonly kind: "doubling"; readonly fromKb: number }
	| { readonly kind: "steps"; readonly kbs: readonly number[] }
	| { readonly kind: "rising"; readonly fromKb: number }
	| { readonly kind: "pays"; readonly kb: number }
	| { readonly kind: "rungs"; readonly rungs: readonly BootCacheRung[] }
	| { readonly kind: "free" }
	| { readonly kind: "unsold" };

export type RegistryControlSpec = {
	readonly id: RegistryControlId;
	readonly glyph: string;
	readonly title: string;
	readonly detail: string;
	readonly unlock: ServiceUnlock;
	readonly lasts: ServiceLasts;
	readonly price: ServicePrice;
	readonly carryBytes?: number;
} & ServiceSale;

export type ServiceUnlockGrant = {
	readonly serviceId: RegistryControlId;
	readonly viaMetric: ObjectiveMetric;
};

const REBUILD_FROM_GATE = 1;

export const CERULEAN_GATE = 2;

export const ABANDON_FROM_GATE = 6;

const UNLOCK_TARGET = 5;

export const reachedGateMetric = (gate: number): ObjectiveMetric =>
	`reached-gate:${gate}`;

const earned = (
	metric: ObjectiveMetric,
	target: number,
	caption: string,
	earnedCaption: string
): ServiceUnlock => ({
	kind: "earned",
	objective: { metric, target, caption, earned: earnedCaption },
});

const reached = (gate: number, caption: string, earnedCaption: string) =>
	earned(reachedGateMetric(gate), 1, caption, earnedCaption);

export const REGISTRY_CONTROLS = {
	rebuild: {
		id: "rebuild",
		glyph: "↻",
		title: "Rebuild the registry",
		detail: "deals a fresh set of offers",
		lasts: "visit",
		price: { kind: "doubling", fromKb: rebuildCost(0) },
		unlock: { kind: "starter" },
		soldIn: "shop",
		opensAfterGates: REBUILD_FROM_GATE,
	},
	skipShop: {
		id: "skipShop",
		glyph: "⏭",
		title: "Skip the shop",
		detail: "leave without touching the registry; paid a little storage",
		lasts: "visit",
		price: { kind: "pays", kb: SKIP_SHOP_KB },
		unlock: { kind: "starter" },
		soldIn: "shop",
		opensAfterGates: REBUILD_FROM_GATE,
	},
	extend: {
		id: "extend",
		glyph: "+",
		title: "Extend the registry",
		detail: "add extra offers throughout the run, against a price",
		lasts: "run",
		price: { kind: "steps", kbs: EXTEND_COST_KB },
		unlock: reached(CERULEAN_GATE, "Reach Cerulean", "reached Cerulean"),
		soldIn: "shop",
		opensAfterGates: EXTEND_FROM_GATE,
		carryBytes: EXTEND_CARRY_BYTES,
	},
	hotReload: {
		id: "hotReload",
		glyph: "⇋",
		title: "Hot reload one offer",
		detail: "reroll a single card, keep the rest",
		lasts: "visit",
		price: { kind: "unsold" },
		unlock: earned(
			"rebuilds",
			UNLOCK_TARGET,
			`Rebuild ${UNLOCK_TARGET} times`,
			`rebuilt ${UNLOCK_TARGET} times`
		),
		soldIn: "shop",
		opensAfterGates: REBUILD_FROM_GATE,
	},
	returnPolicy: {
		id: "returnPolicy",
		glyph: "↩",
		title: "Return policy",
		detail: "sell a drafted config back at full price",
		lasts: "visit",
		price: { kind: "unsold" },
		unlock: earned(
			"configs-sold",
			UNLOCK_TARGET,
			`Sell ${UNLOCK_TARGET} configs`,
			`sold ${UNLOCK_TARGET} configs`
		),
		soldIn: "shop",
		opensAfterGates: REBUILD_FROM_GATE,
	},
	abandon: {
		id: "abandon",
		glyph: "✕",
		title: "kill -9",
		detail: "end this run now; nothing banks",
		lasts: "endsRun",
		price: { kind: "free" },
		unlock: reached(
			ABANDON_FROM_GATE,
			`Clear gate ${ABANDON_FROM_GATE - 1}`,
			`cleared gate ${ABANDON_FROM_GATE - 1}`
		),
		soldIn: "shop",
		opensAfterGates: REBUILD_FROM_GATE,
	},
	pin: {
		id: "pin",
		glyph: "⚑",
		title: "git tag",
		detail:
			"save your last checkpoint once; each gate asks a higher price to activate it",
		lasts: "nextRun",
		price: { kind: "rising", fromKb: pinCostFor(PIN_FROM_GATE) },
		unlock: reached(
			PIN_FROM_GATE,
			`Reach gate ${PIN_FROM_GATE}`,
			`reached gate ${PIN_FROM_GATE}`
		),
		soldIn: "shop",
		opensAfterGates: PIN_FROM_GATE,
		closesAfterGates: PIN_UNTIL_GATE,
		carryBytes: PIN_CARRY_BYTES,
	},
	bootCache: {
		id: "bootCache",
		glyph: "▮",
		title: "Boot Cache",
		detail: "start the next run with storage already banked",
		lasts: "atStart",
		price: { kind: "rungs", rungs: BOOT_CACHE_RUNGS },
		unlock: earned(
			"banked-256-one-run",
			1,
			`Bank ${kbLabel(BOOT_CACHE_BANK_KB)} in one run`,
			`banked ${kbLabel(BOOT_CACHE_BANK_KB)} in one run`
		),
		soldIn: "archive",
	},
	dockerImage: {
		id: "dockerImage",
		glyph: "⧉",
		title: "Docker Image",
		detail: "one config from your last build, offered again at its price",
		lasts: "firstShop",
		price: { kind: "unsold" },
		unlock: earned(
			"finished-holding-a-dealt-config",
			1,
			"Keep a starting config to the end",
			"kept a starting config to the end"
		),
		soldIn: "archive",
	},
} as const satisfies Record<RegistryControlId, RegistryControlSpec>;

export type ShopSoldId = {
	[Id in RegistryControlId]: (typeof REGISTRY_CONTROLS)[Id] extends {
		soldIn: "shop";
	}
		? Id
		: never;
}[RegistryControlId];

export type ShopSoldSpec = Extract<RegistryControlSpec, { soldIn: "shop" }> & {
	readonly id: ShopSoldId;
};

export type CarriedServiceId = {
	[Id in RegistryControlId]: (typeof REGISTRY_CONTROLS)[Id] extends {
		carryBytes: number;
	}
		? Id
		: never;
}[RegistryControlId];

export type CarriedServiceSpec = RegistryControlSpec & {
	readonly id: CarriedServiceId;
	readonly carryBytes: number;
};

export const REGISTRY_CONTROL_LIST: readonly RegistryControlSpec[] =
	Object.values(REGISTRY_CONTROLS);

export const REGISTRY_CONTROL_IDS: readonly RegistryControlId[] =
	REGISTRY_CONTROL_LIST.map((control) => control.id);

export const registryControlOf = (id: RegistryControlId): RegistryControlSpec =>
	REGISTRY_CONTROLS[id];

export const isRegistryControlId = (
	value: string
): value is RegistryControlId =>
	REGISTRY_CONTROL_IDS.some((id) => id === value);

export const isSoldInShop = (
	control: RegistryControlSpec
): control is ShopSoldSpec => control.soldIn === "shop";

export const isCarriedService = (
	control: RegistryControlSpec
): control is CarriedServiceSpec => control.carryBytes !== undefined;

export const openingGateOf = (control: ShopSoldSpec): number =>
	control.opensAfterGates - 1;

export const closingGateOf = (control: ShopSoldSpec): number | undefined =>
	control.closesAfterGates === undefined
		? undefined
		: control.closesAfterGates - 1;

export const isServiceUnlocked = (
	control: RegistryControlSpec,
	unlockedServiceIds: readonly string[]
): boolean =>
	control.unlock.kind === "starter" || unlockedServiceIds.includes(control.id);

export const unlockCaptionOf = (
	control: RegistryControlSpec
): string | undefined =>
	control.unlock.kind === "starter"
		? undefined
		: control.unlock.objective.caption;

export const servicesUnlockedBy = (
	counts: readonly ObjectiveCount[]
): readonly ServiceUnlockGrant[] => {
	const countOf = countsReader(counts);
	return REGISTRY_CONTROL_LIST.flatMap((control) => {
		if (control.unlock.kind === "starter") return [];
		const { metric, target } = control.unlock.objective;
		return countOf(metric) >= target
			? [{ serviceId: control.id, viaMetric: metric }]
			: [];
	});
};

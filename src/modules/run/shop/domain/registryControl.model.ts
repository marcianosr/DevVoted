import type {
	ObjectiveCount,
	ObjectiveMetric,
	ThematicObjective,
} from "~/modules/run/config/domain/configUnlock.model";
import {
	BOOT_CACHE_BANK_KB,
	PIN_FROM_GATE,
	PIN_UNTIL_GATE,
} from "~/modules/run/run/domain/rules.model";
import { EXTEND_FROM_GATE } from "~/modules/run/shop/domain/draft.model";
import { kbLabel } from "~/shared/lib/storage";

export type RegistryControlId =
	| "rebuild"
	| "extend"
	| "hotReload"
	| "returnPolicy"
	| "abandon"
	| "pin"
	| "bootCache"
	| "dockerImage";

export type RegistryControlScope = "registry" | "run";

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

export type RegistryControlSpec = {
	readonly id: RegistryControlId;
	readonly scope: RegistryControlScope;
	readonly glyph: string;
	readonly title: string;
	readonly detail: string;
	readonly unlock: ServiceUnlock;
} & ServiceSale;

export type ServiceUnlockGrant = {
	readonly serviceId: RegistryControlId;
	readonly viaMetric: ObjectiveMetric;
};

const REBUILD_FROM_GATE = 1;

export const CASCADE_GATE = 2;

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
		scope: "registry",
		glyph: "↻",
		title: "Rebuild the registry",
		detail: "deals a fresh set of offers",
		unlock: { kind: "starter" },
		soldIn: "shop",
		opensAfterGates: REBUILD_FROM_GATE,
	},
	extend: {
		id: "extend",
		scope: "registry",
		glyph: "+",
		title: "Extend the registry",
		detail: "one more offer, now and every shop after",
		unlock: reached(CASCADE_GATE, "Reach Cascade", "reached Cascade"),
		soldIn: "shop",
		opensAfterGates: EXTEND_FROM_GATE,
	},
	hotReload: {
		id: "hotReload",
		scope: "registry",
		glyph: "⇋",
		title: "Hot reload one offer",
		detail: "reroll a single card, keep the rest",
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
		scope: "registry",
		glyph: "↩",
		title: "Return policy",
		detail: "sell a drafted config back at full price",
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
		scope: "registry",
		glyph: "✕",
		title: "kill -9",
		detail: "end this run now; nothing banks",
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
		scope: "run",
		glyph: "⚑",
		title: "git tag",
		detail: "if this run dies, the next resumes here",
		unlock: reached(
			PIN_FROM_GATE,
			`Reach gate ${PIN_FROM_GATE}`,
			`reached gate ${PIN_FROM_GATE}`
		),
		soldIn: "shop",
		opensAfterGates: PIN_FROM_GATE,
		closesAfterGates: PIN_UNTIL_GATE,
	},
	bootCache: {
		id: "bootCache",
		scope: "run",
		glyph: "▮",
		title: "Boot Cache",
		detail: "start the next run with storage already banked",
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
		scope: "run",
		glyph: "⧉",
		title: "Docker Image",
		detail: "one config from your last build, offered again at its price",
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

export const REGISTRY_CONTROL_LIST: readonly RegistryControlSpec[] =
	Object.values(REGISTRY_CONTROLS);

export const REGISTRY_CONTROL_IDS: readonly RegistryControlId[] =
	REGISTRY_CONTROL_LIST.map((control) => control.id);

export const isSoldInShop = (
	control: RegistryControlSpec
): control is ShopSoldSpec => control.soldIn === "shop";

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
	const countByMetric = new Map(
		counts.map((row) => [row.metric, row.count] as const)
	);
	return REGISTRY_CONTROL_LIST.flatMap((control) => {
		if (control.unlock.kind === "starter") return [];
		const { metric, target } = control.unlock.objective;
		return (countByMetric.get(metric) ?? 0) >= target
			? [{ serviceId: control.id, viaMetric: metric }]
			: [];
	});
};

import type { CategoryCode } from "~/domains/shared/categories";
import { getCategoryMetadata } from "~/domains/shared/categories";

export type ConfigFamily =
	"focus" | "defense" | "risk" | "amplify" | "economy" | "check";

export type CheckKind =
	| "correct"
	| "coverage-gain"
	| "cold-start"
	| "min-correct"
	| "no-double-miss"
	| "breadth"
	| "lint-correct";

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type Config = {
	readonly id: string;
	readonly label: string;
	readonly family: ConfigFamily;
	readonly rarity?: Rarity;
	readonly description: string;
	/** Benefit phrase — the pipeline row's "gives" line. */
	readonly gives?: string;
	/** Demand phrase — the "needs" line. Omit when the demand escalates (the
	 * correct check): the live check text shows instead. */
	readonly needs?: string;
	/** Price phrase — the "costs" line (a linter's escalating fee and pledge). */
	readonly costs?: string;
	readonly requirementDelta: number;
	readonly rewardMultiplier: number;
	readonly focusCategory?: CategoryCode;
	readonly eliminatesWrongOptionsFor?: readonly CategoryCode[];
	readonly coverageMultiplier?: number;
	readonly coverageAdd?: number;
	readonly level?: number;
	readonly storagePerCorrect?: number;
	readonly storageOnClear?: number;
	readonly openerCoverageMultiplier?: number;
	readonly check?: CheckKind;
	readonly checkAmount?: number;
};

export const rarityOf = (config: Config): Rarity => config.rarity ?? "common";

export const focusCoverageMultiplier = (level: number): number =>
	1 + 0.5 * level;

export const focusDemand = (config: Config): number => config.level ?? 1;

export const upgradeCoverageRequired = (currentLevel: number): number =>
	currentLevel * 5;

const DRAFT_COST: Record<Rarity, number> = {
	common: 32,
	uncommon: 64,
	rare: 128,
	legendary: 256,
};

export const draftCost = (config: Config): number =>
	DRAFT_COST[rarityOf(config)];

/** Storage returned on selling a config — half its draft cost (market value). */
export const sellRefund = (config: Config): number =>
	Math.floor(draftCost(config) / 2);

// Unit Tests is deliberately absent: its check escalates on its own with gate
// depth, and escalation + a paid upgrade would be two mechanisms raising the
// same number (wiki §4.4).
export const isUpgradable = (config: Config): boolean =>
	config.focusCategory !== undefined;

export const describeConfig = (config: Config): string => {
	if (!config.focusCategory) return config.description;
	const name = getCategoryMetadata(config.focusCategory).name;
	const level = config.level ?? 1;
	return `${name} polls earn ${focusCoverageMultiplier(level)}× coverage — but if ${name} shows, you must get ${level} right.`;
};

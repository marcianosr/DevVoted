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
	/** Upgrade ceiling. Omitted = the default (5, the 5-poll window's natural demand ceiling). */
	readonly maxLevel?: number;
	readonly storagePerCorrect?: number;
	readonly storageOnClear?: number;
	readonly openerCoverageMultiplier?: number;
	readonly check?: CheckKind;
	readonly checkAmount?: number;
};

export const rarityOf = (config: Config): Rarity => config.rarity ?? "common";

export const focusCoverageMultiplier = (level: number): number =>
	1 + 0.25 * level;

export const focusDemand = (config: Config): number => config.level ?? 1;

export const upgradeCoverageRequired = (currentLevel: number): number =>
	currentLevel * 5;

const UPGRADE_STORAGE_STEP_KB = 32;

/** KB price of a storage-priced upgrade (Unit Tests): 32 × the level being bought. */
export const upgradeStorageCost = (currentLevel: number): number =>
	UPGRADE_STORAGE_STEP_KB * (currentLevel + 1);

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

const DEFAULT_MAX_LEVEL = 5;

export const maxLevelOf = (config: Config): number =>
	config.maxLevel ?? DEFAULT_MAX_LEVEL;

// Focus configs upgrade freely behind a coverage gate. Unit Tests upgrades
// for storage, buying payout AND demand together; each config's ceiling
// lives on the config itself (maxLevel, default DEFAULT_MAX_LEVEL).
export const isUpgradable = (config: Config): boolean => {
	const upgradable =
		config.focusCategory !== undefined || config.check === "correct";
	return upgradable && (config.level ?? 1) < maxLevelOf(config);
};

export const describeConfig = (config: Config): string => {
	if (config.check === "correct") {
		const level = config.level ?? 1;
		const payout = (config.storageOnClear ?? 0) * level;
		return `+${payout}KB storage on gate clear — demands ${level} correct answer${level === 1 ? "" : "s"}, rising as you climb.`;
	}
	if (!config.focusCategory) return config.description;
	const name = getCategoryMetadata(config.focusCategory).name;
	const level = config.level ?? 1;
	return `${name} polls earn ${focusCoverageMultiplier(level)}× coverage — but if ${name} shows, you must get ${level} right.`;
};

// A focus config's gives/needs derive from its level, like describeConfig —
// the roster only knows L1, so authored copy goes stale after an upgrade
// (DVTD-a6yf). Non-focus copy stays authored on the roster.
export const givesOf = (config: Config): string | undefined => {
	if (config.check === "correct") {
		const payout = (config.storageOnClear ?? 0) * (config.level ?? 1);
		return `Then +${payout}KB on clear`;
	}
	if (!config.focusCategory) return config.gives;
	const name = getCategoryMetadata(config.focusCategory).name;
	const multiplier = focusCoverageMultiplier(config.level ?? 1);
	return `Then ${name} polls earn ×${multiplier} coverage`;
};

export const needsOf = (config: Config): string | undefined => {
	if (!config.focusCategory) return config.needs;
	const name = getCategoryMetadata(config.focusCategory).name;
	const demand = focusDemand(config);
	return `Get ${demand} ${name} poll${demand === 1 ? "" : "s"} right`;
};

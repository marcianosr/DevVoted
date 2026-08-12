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
	| "lint-correct"
	| "defeat-device";

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type Config = {
	readonly id: string;
	readonly label: string;
	readonly family: ConfigFamily;
	readonly rarity?: Rarity;
	readonly description: string;
	readonly gives?: string;
	readonly needs?: string;
	readonly costs?: string;
	readonly requirementDelta: number;
	readonly rewardMultiplier: number;
	readonly focusCategory?: CategoryCode;
	readonly eliminatesWrongOptionsFor?: readonly CategoryCode[];
	readonly coverageMultiplier?: number;
	readonly coverageAdd?: number;
	readonly level?: number;
	readonly maxLevel?: number;
	readonly storagePerCorrect?: number;
	readonly storageOnClear?: number;
	readonly openerCoverageMultiplier?: number;
	readonly check?: CheckKind;
	readonly checkAmount?: number;
	readonly draftCost?: number;
};

export const rarityOf = (config: Config): Rarity => config.rarity ?? "common";

export const focusCoverageMultiplier = (level: number): number =>
	1 + 0.25 * level;

export const focusDemand = (config: Config): number => config.level ?? 1;

export const upgradeCoverageRequired = (currentLevel: number): number =>
	currentLevel * 5;

const UPGRADE_STORAGE_STEP_KB = 32;

export const upgradeStorageCost = (currentLevel: number): number =>
	UPGRADE_STORAGE_STEP_KB * (currentLevel + 1);

const DRAFT_COST: Record<Rarity, number> = {
	common: 32,
	uncommon: 64,
	rare: 128,
	legendary: 256,
};

export const draftCost = (config: Config): number =>
	config.draftCost ?? DRAFT_COST[rarityOf(config)];

export const CHEAPEST_DRAFT_COST_KB = Math.min(...Object.values(DRAFT_COST));

export const sellRefund = (config: Config): number =>
	Math.floor(draftCost(config) / 2);

const DEFAULT_MAX_LEVEL = 5;

export const maxLevelOf = (config: Config): number =>
	config.maxLevel ?? DEFAULT_MAX_LEVEL;

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

export const givesOf = (config: Config): string | undefined => {
	if (config.check === "correct") {
		const payout = (config.storageOnClear ?? 0) * (config.level ?? 1);
		return `+${payout}KB on clear`;
	}
	if (!config.focusCategory) return config.gives;
	const name = getCategoryMetadata(config.focusCategory).name;
	const multiplier = focusCoverageMultiplier(config.level ?? 1);
	return `${name} polls reward ×${multiplier} coverage`;
};

export const needsOf = (config: Config): string | undefined => {
	if (!config.focusCategory) return config.needs;
	const name = getCategoryMetadata(config.focusCategory).name;
	return `Answer ${name} polls correct when they show`;
};

/** The faucet: KB a build pays out per correct answer. */
export const faucetKbPerCorrect = (configs: readonly Config[]): number =>
	configs.reduce((sum, config) => sum + (config.storagePerCorrect ?? 0), 0);

import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";

export type ConfigFamily = "focus" | "defense" | "risk" | "amplify" | "economy";

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type Config = {
	readonly id: string;
	readonly label: string;
	readonly family: ConfigFamily;
	readonly rarity?: Rarity;
	readonly description: string;
	readonly gives?: string;
	readonly costs?: string;
	readonly rewardMultiplier: number;
	readonly focusCategory?: CategoryCode;
	readonly eliminatesWrongOptionsFor?: readonly CategoryCode[];
	readonly coverageMultiplier?: number;
	readonly coverageAdd?: number;
	readonly level?: number;
	readonly maxLevel?: number;
	readonly storagePerCorrect?: number;
	readonly storageOnClear?: number;
	readonly storageInterestPct?: number;
	readonly openerCoverageMultiplier?: number;
	readonly throttleCoverageMultiplier?: number;
	readonly peeksCommunitySplit?: boolean;
	readonly storagePerExtraPick?: number;
	readonly suppressesAudit?: boolean;
	readonly autoUpgradeOneIn?: number;
	readonly coverageDecayPerClear?: number;
	readonly offersFullRoster?: boolean;
	readonly revealsUpcomingCategories?: boolean;
	readonly draftCostFactor?: number;
	readonly subscriptionKb?: number;
	readonly subscriptionGrowthPerGate?: number;
	readonly draftCost?: number;
};

export const rarityOf = (config: Config): Rarity => config.rarity ?? "common";

export const focusCoverageMultiplier = (level: number): number =>
	1 + 0.25 * level;

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
		config.focusCategory !== undefined ||
		config.storageOnClear !== undefined ||
		config.storageInterestPct !== undefined ||
		config.peeksCommunitySplit === true ||
		config.autoUpgradeOneIn !== undefined;
	return upgradable && (config.level ?? 1) < maxLevelOf(config);
};

export const levelUp = (config: Config): Config => ({
	...config,
	level: (config.level ?? 1) + 1,
});

export const autoUpgradeOneInOf = (config: Config): number | undefined =>
	config.autoUpgradeOneIn === undefined
		? undefined
		: config.autoUpgradeOneIn - ((config.level ?? 1) - 1);

const SAMPLE_SIZE_LEVEL = 2;

export const showsSampleSize = (config: Config): boolean =>
	(config.level ?? 1) >= SAMPLE_SIZE_LEVEL;

export const interestPctOf = (config: Config): number =>
	(config.storageInterestPct ?? 0) * (config.level ?? 1);

export const describeConfig = (config: Config): string => {
	// Reads the live multiplier, not the roster's: the chip must fade with it.
	if (config.coverageDecayPerClear !== undefined)
		return `All coverage earns ×${config.coverageMultiplier}, fading ×${config.coverageDecayPerClear} each gate clear. Deleted at ×1.`;
	if (config.autoUpgradeOneIn !== undefined)
		return `1 in ${autoUpgradeOneInOf(config)} gate clears: a random config in your pipeline upgrades, free.`;
	if (config.peeksCommunitySplit)
		return showsSampleSize(config)
			? "Pay a doubling fee to see how the community answered this poll, and how many answered."
			: "Pay a doubling fee to see how the community answered this poll.";
	if (config.storageInterestPct !== undefined)
		return `+${interestPctOf(config)}% of held storage on gate clear.`;
	if (config.storageOnClear !== undefined) {
		const payout = config.storageOnClear * (config.level ?? 1);
		return `+${payout}KB storage on gate clear.`;
	}
	if (!config.focusCategory) return config.description;
	const name = getCategoryMetadata(config.focusCategory).name;
	const level = config.level ?? 1;
	return `${name} polls earn ${focusCoverageMultiplier(level)}× coverage.`;
};

/**
 * The one figure a config leads with, as data rather than prose. `describeOf`
 * already states it in a sentence; a badge needs the number on its own, and
 * parsing it back out of the sentence would drift the first time the copy
 * changed. Order follows what the description leads with.
 */
export type ConfigFigure =
	| { readonly kind: "multiplier"; readonly value: number }
	| { readonly kind: "coverage"; readonly value: number }
	| { readonly kind: "kb"; readonly value: number }
	/** A percentage of something the config holds, never of coverage. */
	| { readonly kind: "percent"; readonly value: number }
	| { readonly kind: "chance"; readonly oneIn: number };

export const headlineFigureOf = (config: Config): ConfigFigure | undefined => {
	if (config.focusCategory)
		return {
			kind: "multiplier",
			value: focusCoverageMultiplier(config.level ?? 1),
		};
	if (config.coverageMultiplier !== undefined)
		return { kind: "multiplier", value: config.coverageMultiplier };
	if (config.coverageAdd !== undefined)
		return { kind: "coverage", value: config.coverageAdd };
	if (config.storagePerCorrect !== undefined)
		return { kind: "kb", value: config.storagePerCorrect };
	if (config.storageOnClear !== undefined)
		return { kind: "kb", value: config.storageOnClear * (config.level ?? 1) };

	// Below here the figure is real but conditional, so it ranks under any flat
	// rate above: a config holding both leads with the rate it always pays.
	if (config.openerCoverageMultiplier !== undefined)
		return { kind: "multiplier", value: config.openerCoverageMultiplier };
	if (config.storagePerExtraPick !== undefined)
		return { kind: "kb", value: config.storagePerExtraPick };
	if (config.storageInterestPct !== undefined)
		return { kind: "percent", value: interestPctOf(config) };
	if (config.draftCostFactor !== undefined)
		return { kind: "multiplier", value: config.draftCostFactor };

	const oneIn = autoUpgradeOneInOf(config);
	if (oneIn !== undefined) return { kind: "chance", oneIn };

	// What is left is a switch, not a rate: crossing out an option, reading the
	// split, suppressing an audit. There is no number to withhold.
	return undefined;
};

export const givesOf = (config: Config): string | undefined => {
	if (config.coverageDecayPerClear !== undefined)
		return `All coverage earns ×${config.coverageMultiplier}, fading ×${config.coverageDecayPerClear} per clear`;
	if (config.autoUpgradeOneIn !== undefined)
		return `A free random config upgrade on 1 in ${autoUpgradeOneInOf(config)} gate clears`;
	if (config.peeksCommunitySplit)
		return showsSampleSize(config)
			? "See how the community answered, and how many answered"
			: "See how the community answered this poll";
	if (config.storageInterestPct !== undefined)
		return `+${interestPctOf(config)}% of held storage on clear`;
	if (config.storageOnClear !== undefined) {
		const payout = config.storageOnClear * (config.level ?? 1);
		return `+${payout}KB on clear`;
	}
	if (!config.focusCategory) return config.gives;
	const name = getCategoryMetadata(config.focusCategory).name;
	const multiplier = focusCoverageMultiplier(config.level ?? 1);
	return `${name} polls reward ×${multiplier} coverage`;
};

/** The faucet: KB a build pays out per correct answer. */ export const faucetKbPerCorrect =
	(configs: readonly Config[]): number =>
		configs.reduce((sum, config) => sum + (config.storagePerCorrect ?? 0), 0);

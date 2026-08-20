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
	/** Percent of held storage paid on gate clear — the only benefit that reads
	 * the balance rather than the window, so it compounds. */
	readonly storageInterestPct?: number;
	readonly openerCoverageMultiplier?: number;
	/** What every answer after the window's opener earns (Overclock) — the
	 * opener multiplier's counterpart and the one benefit priced below ×1: the
	 * config front-loads the gate rather than growing it. Rides the window's
	 * answered count, so each gate cools off at the clear. */
	readonly throttleCoverageMultiplier?: number;
	/** Sells a look at how everyone else answered the current poll, for a fee that
	 * doubles per use. The only benefit that pays in information rather than in
	 * coverage or KB, so it is a flag: what it hands over is a whole screen, not a
	 * number the pipeline can multiply. */
	readonly peeksCommunitySplit?: boolean;
	/** KB paid on clear per correct answer the window held beyond one per poll, so
	 * the payout is a function of the window's shape rather than the loadout — it
	 * pays most in exactly the windows with the most multi-answer polls. */
	readonly storagePerExtraPick?: number;
	/** Reports the gate's first audit as passing (Volkswagen CI, ADR-028/035) —
	 * the one benefit aimed at the gate's own rules rather than the window. */
	readonly suppressesAudit?: boolean;
	/** One-in-N odds that each gate clear levels up a random pipeline config,
	 * free (Dependabot) — the one benefit that pays in levels. The denominator
	 * shortens by one per level, so L2 turns 1-in-3 into 1-in-2. */
	readonly autoUpgradeOneIn?: number;
	/** What `coverageMultiplier` loses at each gate clear (Deprecated) — the one
	 * config with a lifespan: it deletes itself when the multiplier fades to ×1,
	 * so the drawback is the countdown, not a fee. */
	readonly coverageDecayPerClear?: number;
	/** Every shop lays out the entire remaining roster instead of a rolled five
	 * (WTFPL) — the one benefit that pays in shop agency (ADR-029's axis). The
	 * three paid shop controls retire while it is installed: they sell slices
	 * of the freedom this already grants. */
	readonly offersFullRoster?: boolean;
	/** Shows the category of every poll left this gate and all of the next
	 * gate's (Prefetch) — information about the draw itself, which no other
	 * config reads. Asking for polls not yet dealt rolls tomorrow's shared
	 * seed a day early; the reveal is category-only, the questions stay
	 * sealed. */
	readonly revealsUpcomingCategories?: boolean;
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

/**
 * Whether a peek comes with the number of answers behind it. L1 sells the
 * percentages alone, so 100% of two players and 100% of a hundred read
 * identically — the upgrade buys the one line that tells them apart, which is
 * the whole product of level 2 (see the roster entry).
 */
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

/** The faucet: KB a build pays out per correct answer. */
export const faucetKbPerCorrect = (configs: readonly Config[]): number =>
	configs.reduce((sum, config) => sum + (config.storagePerCorrect ?? 0), 0);

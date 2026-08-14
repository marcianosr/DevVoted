import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";
import { formatKb } from "~/shared/lib/storage";

export type ConfigFamily =
	"focus" | "defense" | "risk" | "amplify" | "economy" | "check";

export type CheckKind =
	| "correct"
	| "coverage-gain"
	| "cold-start"
	| "min-correct"
	| "no-double-miss"
	| "breadth"
	| "storage-floor"
	| "peek-count"
	| "pick-budget"
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
	/** Percent of held storage paid on gate clear — the only benefit that reads
	 * the balance rather than the window, so it compounds. */
	readonly storageInterestPct?: number;
	readonly openerCoverageMultiplier?: number;
	/** Sells a look at how everyone else answered the current poll, for a fee that
	 * doubles per use. The only benefit that pays in information rather than in
	 * coverage or KB, so it is a flag: what it hands over is a whole screen, not a
	 * number the pipeline can multiply. */
	readonly peeksCommunitySplit?: boolean;
	/** KB paid on clear per correct answer the window held beyond one per poll, so
	 * the payout is a function of the window's shape rather than the loadout — it
	 * pays most in exactly the windows whose pick budget was hardest to hit. */
	readonly storagePerExtraPick?: number;
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
		config.focusCategory !== undefined ||
		config.check === "correct" ||
		config.storageInterestPct !== undefined ||
		config.peeksCommunitySplit === true;
	return upgradable && (config.level ?? 1) < maxLevelOf(config);
};

const SAMPLE_SIZE_LEVEL = 2;

/**
 * Whether a peek comes with the number of answers behind it. L1 sells the
 * percentages alone, so 100% of two players and 100% of a hundred read
 * identically — the upgrade buys the one line that tells them apart, which is
 * the whole product of level 2 (see the roster entry).
 */
export const showsSampleSize = (config: Config): boolean =>
	(config.level ?? 1) >= SAMPLE_SIZE_LEVEL;

const DEFAULT_PEEK_DEMAND = 1;

const peekDemandPhrase = (config: Config): string => {
	const target = config.checkAmount ?? DEFAULT_PEEK_DEMAND;
	return target === 1 ? "once each gate" : `${target}× each gate`;
};

export const interestPctOf = (config: Config): number =>
	(config.storageInterestPct ?? 0) * (config.level ?? 1);

export const interestFloorKbOf = (config: Config): number =>
	(config.checkAmount ?? 0) * (config.level ?? 1);

export const describeConfig = (config: Config): string => {
	if (config.peeksCommunitySplit)
		return showsSampleSize(config)
			? `Pay a doubling fee to see how the community answered this poll, and how many answered — but you must peek at least ${peekDemandPhrase(config)}.`
			: `Pay a doubling fee to see how the community answered this poll — but you must peek at least ${peekDemandPhrase(config)}.`;
	if (config.storageInterestPct !== undefined)
		return `+${interestPctOf(config)}% of held storage on gate clear — hold ${formatKb(interestFloorKbOf(config))} when the gate resolves.`;
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
	if (config.peeksCommunitySplit)
		return showsSampleSize(config)
			? "See how the community answered, and how many answered"
			: "See how the community answered this poll";
	if (config.storageInterestPct !== undefined)
		return `+${interestPctOf(config)}% of held storage on clear`;
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
	if (config.peeksCommunitySplit)
		return `Peek at least ${peekDemandPhrase(config)}`;
	if (config.storageInterestPct !== undefined)
		return `Hold ${formatKb(interestFloorKbOf(config))} when the gate resolves`;
	if (!config.focusCategory) return config.needs;
	const name = getCategoryMetadata(config.focusCategory).name;
	return `Answer ${name} polls correct when they show`;
};

/** The faucet: KB a build pays out per correct answer. */
export const faucetKbPerCorrect = (configs: readonly Config[]): number =>
	configs.reduce((sum, config) => sum + (config.storagePerCorrect ?? 0), 0);

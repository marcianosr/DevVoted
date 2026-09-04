import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";

export type ConfigFamily = "focus" | "defense" | "risk" | "amplify" | "economy";

export type AbArm = "coverage" | "storage";

export type ConfigSize = 1 | 2 | 4 | 8 | 12 | 16;

export type Config = {
	readonly id: string;
	readonly label: string;
	readonly family: ConfigFamily;
	readonly slots?: ConfigSize;
	readonly description: string;
	readonly gives?: string;
	readonly costs?: string;
	readonly rewardMultiplier: number;
	readonly focusCategory?: CategoryCode;
	readonly eliminatesWrongOptionsFor?: readonly CategoryCode[];
	readonly coverageMultiplier?: number;
	readonly coverageAdd?: number;
	readonly streakCapSteps?: number;
	readonly level?: number;
	readonly maxLevel?: number;
	readonly storagePerCorrect?: number;
	readonly storageOnClear?: number;
	readonly storageInterestPct?: number;
	readonly openerCoverageMultiplier?: number;
	readonly throttleCoverageMultiplier?: number;
	readonly cacheHitStep?: number;
	readonly abArm?: AbArm;
	readonly peeksCommunitySplit?: boolean;
	readonly storagePerExtraPick?: number;
	readonly suppressesAudit?: boolean;
	readonly autoUpgradeOneIn?: number;
	readonly coverageDecayPerClear?: number;
	readonly offersFullRoster?: boolean;
	readonly locksOffers?: boolean;
	readonly revealsUpcomingCategories?: boolean;
	readonly revealsCorrectCount?: boolean;
	readonly draftCostFactor?: number;
	readonly subscriptionKb?: number;
	readonly subscriptionGrowthPerGate?: number;
	readonly draftCost?: number;
	readonly minified?: boolean;
};

export const minifiedMultiplier = (
	config: Config,
	multiplier: number
): number => (config.minified === true ? 1 + (multiplier - 1) / 2 : multiplier);

export const minifiedAmount = (config: Config, amount: number): number =>
	config.minified === true ? Math.floor(amount / 2) : amount;

export const focusCoverageMultiplier = (level: number): number =>
	1 + 0.25 * level;

export const focusMultiplierOf = (config: Config): number =>
	minifiedMultiplier(config, focusCoverageMultiplier(config.level ?? 1));

export const upgradeCoverageRequired = (currentLevel: number): number =>
	currentLevel * 5;

const UPGRADE_STORAGE_STEP_KB = 32;

export const upgradeStorageCost = (currentLevel: number): number =>
	UPGRADE_STORAGE_STEP_KB * (currentLevel + 1);

export const CONFIG_SIZES = [
	1, 2, 4, 8, 12, 16,
] as const satisfies readonly ConfigSize[];

export const baseSlotsOf = (config: Config): number => config.slots ?? 1;

export const slotsOf = (config: Config): number =>
	config.minified === true
		? Math.floor(baseSlotsOf(config) / 2)
		: baseSlotsOf(config);

export const canMinify = (config: Config): boolean =>
	config.minified !== true && baseSlotsOf(config) >= 2;

export const minify = (config: Config): Config => ({
	...config,
	minified: true,
});

export const minifySavingSlots = (config: Config): number =>
	canMinify(config) ? slotsOf(config) - Math.floor(slotsOf(config) / 2) : 0;

export const largestSizeFitting = (slots: number): ConfigSize | null =>
	[...CONFIG_SIZES].reverse().find((size) => size <= slots) ?? null;

export const DRAFT_COST_PER_SLOT_KB = 32;

export const draftCost = (config: Config): number =>
	config.draftCost ?? DRAFT_COST_PER_SLOT_KB * baseSlotsOf(config);

export const CHEAPEST_DRAFT_COST_KB = DRAFT_COST_PER_SLOT_KB * CONFIG_SIZES[0];

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
	minifiedAmount(
		config,
		(config.storageInterestPct ?? 0) * (config.level ?? 1)
	);

export const storageOnClearOf = (config: Config): number | undefined =>
	config.storageOnClear === undefined
		? undefined
		: minifiedAmount(config, config.storageOnClear * (config.level ?? 1));

export const describeConfig = (config: Config): string => {
	if (config.coverageDecayPerClear !== undefined)
		return `All coverage earns ×${config.coverageMultiplier}, fading ×${config.coverageDecayPerClear} each gate clear. Deleted at ×1.`;
	if (config.autoUpgradeOneIn !== undefined)
		return `1 in ${autoUpgradeOneInOf(config)} gate clears: a random config in your build upgrades, free.`;
	if (config.peeksCommunitySplit)
		return showsSampleSize(config)
			? "Pay a doubling fee to see how the community answered this poll, and how many answered."
			: "Pay a doubling fee to see how the community answered this poll.";
	if (config.storageInterestPct !== undefined)
		return `+${interestPctOf(config)}% of held storage on gate clear.`;
	if (config.storageOnClear !== undefined)
		return `+${storageOnClearOf(config)}KB storage on gate clear.`;
	if (!config.focusCategory) return config.description;
	const name = getCategoryMetadata(config.focusCategory).name;
	return `${name} polls earn ${focusMultiplierOf(config)}× coverage.`;
};

export type UpgradeChange = {
	readonly from: string;
	readonly to: string;
};

export const upgradePreview = (config: Config): readonly UpgradeChange[] => {
	const next = levelUp(config);

	return [
		...(config.autoUpgradeOneIn === undefined
			? []
			: [
					{
						from: `1 in ${autoUpgradeOneInOf(config)}`,
						to: `1 in ${autoUpgradeOneInOf(next)}`,
					},
				]),
		...(config.peeksCommunitySplit === true
			? [
					{
						from: showsSampleSize(config) ? "with sample size" : "split only",
						to: showsSampleSize(next) ? "with sample size" : "split only",
					},
				]
			: []),
		...(config.storageInterestPct === undefined
			? []
			: [
					{
						from: `+${interestPctOf(config)}%`,
						to: `+${interestPctOf(next)}%`,
					},
				]),
		...(config.storageOnClear === undefined
			? []
			: [
					{
						from: `+${storageOnClearOf(config)}KB`,
						to: `+${storageOnClearOf(next)}KB`,
					},
				]),
		...(config.focusCategory === undefined
			? []
			: [
					{
						from: `${focusMultiplierOf(config)}×`,
						to: `${focusMultiplierOf(next)}×`,
					},
				]),
	].filter((change) => change.from !== change.to);
};

export type ConfigFigure =
	| { readonly kind: "multiplier"; readonly value: number }
	| { readonly kind: "coverage"; readonly value: number }
	| { readonly kind: "kb"; readonly value: number }
	| { readonly kind: "percent"; readonly value: number }
	| { readonly kind: "chance"; readonly oneIn: number };

export const headlineFigureOf = (config: Config): ConfigFigure | undefined => {
	if (config.focusCategory)
		return { kind: "multiplier", value: focusMultiplierOf(config) };
	if (config.coverageMultiplier !== undefined)
		return {
			kind: "multiplier",
			value: minifiedMultiplier(config, config.coverageMultiplier),
		};
	if (config.coverageAdd !== undefined)
		return {
			kind: "coverage",
			value: minifiedAmount(config, config.coverageAdd),
		};
	if (config.storagePerCorrect !== undefined)
		return {
			kind: "kb",
			value: minifiedAmount(config, config.storagePerCorrect),
		};
	const onClear = storageOnClearOf(config);
	if (onClear !== undefined) return { kind: "kb", value: onClear };

	if (config.openerCoverageMultiplier !== undefined)
		return {
			kind: "multiplier",
			value: minifiedMultiplier(config, config.openerCoverageMultiplier),
		};
	if (config.storagePerExtraPick !== undefined)
		return {
			kind: "kb",
			value: minifiedAmount(config, config.storagePerExtraPick),
		};
	if (config.storageInterestPct !== undefined)
		return { kind: "percent", value: interestPctOf(config) };

	const oneIn = autoUpgradeOneInOf(config);
	if (oneIn !== undefined) return { kind: "chance", oneIn };

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
	if (config.storageOnClear !== undefined)
		return `+${storageOnClearOf(config)}KB on clear`;
	if (!config.focusCategory) return config.gives;
	const name = getCategoryMetadata(config.focusCategory).name;
	return `${name} polls reward ×${focusMultiplierOf(config)} coverage`;
};

const AB_COVERAGE_MULTIPLIER = 1.25;
const AB_STORAGE_PER_CORRECT = 8;

export const AB_ARMS = {
	coverage: {
		coverageMultiplier: AB_COVERAGE_MULTIPLIER,
		storagePerCorrect: undefined,
		description: `Arm A is live — all coverage earns ×${AB_COVERAGE_MULTIPLIER}. Arm B holds +${AB_STORAGE_PER_CORRECT}KB per correct answer.`,
		gives: `Arm A — all coverage earns ×${AB_COVERAGE_MULTIPLIER}`,
	},
	storage: {
		coverageMultiplier: undefined,
		storagePerCorrect: AB_STORAGE_PER_CORRECT,
		description: `Arm B is live — +${AB_STORAGE_PER_CORRECT}KB per correct answer. Arm A holds ×${AB_COVERAGE_MULTIPLIER} coverage.`,
		gives: `Arm B — +${AB_STORAGE_PER_CORRECT}KB per correct answer`,
	},
} as const;

export const otherArmOf = (config: Config): AbArm | undefined => {
	if (config.abArm === undefined) return undefined;
	return config.abArm === "coverage" ? "storage" : "coverage";
};

export const abArmLabel = (arm: AbArm): string =>
	arm === "coverage" ? "A" : "B";

export const switchArm = (config: Config): Config => {
	const arm = otherArmOf(config);
	if (arm === undefined) return config;
	return { ...config, abArm: arm, ...AB_ARMS[arm] };
};

export const CACHE_HIT_CAP = 4;

export const cacheHitMultiplier = (step: number, hits: number): number =>
	1 + step * Math.min(hits, CACHE_HIT_CAP);

export const cacheMultiplierFor = (
	config: Config,
	cachedHits: number
): number =>
	config.cacheHitStep === undefined || cachedHits <= 0
		? 1
		: minifiedMultiplier(
				config,
				cacheHitMultiplier(config.cacheHitStep, cachedHits)
			);

export const faucetKbPerCorrect = (configs: readonly Config[]): number =>
	configs.reduce(
		(sum, config) =>
			sum + minifiedAmount(config, config.storagePerCorrect ?? 0),
		0
	);

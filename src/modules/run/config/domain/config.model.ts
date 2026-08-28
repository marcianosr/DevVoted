import type { CategoryCode } from "~/shared/lib/categories";
import { getCategoryMetadata } from "~/shared/lib/categories";

export type ConfigFamily = "focus" | "defense" | "risk" | "amplify" | "economy";

export type Rarity = "bit" | "crumb" | "nibble" | "byte";

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
	readonly streakCapSteps?: number;
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
	readonly revealsCorrectCount?: boolean;
	readonly draftCostFactor?: number;
	readonly subscriptionKb?: number;
	readonly subscriptionGrowthPerGate?: number;
	readonly draftCost?: number;
	readonly minified?: boolean;
};

export const rarityOf = (config: Config): Rarity => config.rarity ?? "bit";

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

export const RARITY_WEIGHT: Record<Rarity, number> = {
	bit: 60,
	crumb: 25,
	nibble: 12,
	byte: 3,
};

export const RARITY_ODDS: Record<Rarity, string> = {
	bit: "1 in 2",
	crumb: "1 in 4",
	nibble: "1 in 8",
	byte: "1 in 33",
};

export const SPOTS_PER_GRADE: Record<Rarity, number> = {
	bit: 1,
	crumb: 2,
	nibble: 4,
	byte: 8,
};

export const baseSpotsOf = (config: Config): number =>
	SPOTS_PER_GRADE[rarityOf(config)];

const COUNT_WORDS = [
	"no",
	"one",
	"two",
	"three",
	"four",
	"five",
	"six",
	"seven",
	"eight",
] as const;

const countWord = (count: number): string =>
	count < COUNT_WORDS.length ? COUNT_WORDS[count] : String(count);

const gradeGroupName = (grade: Rarity, count: number): string =>
	count === 1 ? `a ${grade}` : `${countWord(count)} ${grade}s`;

export const shapeOf = (configs: readonly Config[]): string => {
	const groups = GRADES_BY_SIZE.map((grade) => ({
		grade,
		count: configs.filter((config) => rarityOf(config) === grade).length,
	})).filter((group) => group.count > 0);

	if (groups.length === 0) return "nothing";

	const named = groups.map((group) => gradeGroupName(group.grade, group.count));
	const last = named[named.length - 1];
	return named.length === 1
		? last
		: `${named.slice(0, -1).join(", ")} and ${last}`;
};

export const spotsOf = (config: Config): number =>
	config.minified === true
		? Math.floor(baseSpotsOf(config) / 2)
		: baseSpotsOf(config);

export const canMinify = (config: Config): boolean =>
	config.minified !== true && baseSpotsOf(config) >= 2;

export const minify = (config: Config): Config => ({
	...config,
	minified: true,
});

export const minifySavingSpots = (config: Config): number =>
	canMinify(config) ? spotsOf(config) - Math.floor(spotsOf(config) / 2) : 0;

export const largestGradeFitting = (spots: number): Rarity | null =>
	[...GRADES_BY_SIZE].find((grade) => SPOTS_PER_GRADE[grade] <= spots) ?? null;

const GRADES_BY_SIZE = [
	"byte",
	"nibble",
	"crumb",
	"bit",
] as const satisfies readonly Rarity[];

const DRAFT_COST: Record<Rarity, number> = {
	bit: 32,
	crumb: 64,
	nibble: 128,
	byte: 256,
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
		return `1 in ${autoUpgradeOneInOf(config)} gate clears: a random config in your pipeline upgrades, free.`;
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

export const faucetKbPerCorrect = (configs: readonly Config[]): number =>
	configs.reduce(
		(sum, config) =>
			sum + minifiedAmount(config, config.storagePerCorrect ?? 0),
		0
	);

import type { CategoryCode } from "~/shared/lib/categories";
import { CATEGORY_CODES, getCategoryMetadata } from "~/shared/lib/categories";

export type AbArm = "coverage" | "storage";

export type ConfigSize = 1 | 2 | 4 | 8 | 12 | 16;

export type Config = {
	readonly id: string;
	readonly label: string;
	readonly slots?: ConfigSize;
	readonly description: string;
	readonly gives?: string;
	readonly costs?: string;
	readonly rewardMultiplier?: number;
	readonly focusCategory?: CategoryCode;
	readonly eliminatesWrongOptionsFor?: readonly CategoryCode[];
	readonly coverageMultiplier?: number;
	readonly coverageAdd?: number;
	readonly roundsPartialUnitsUp?: boolean;
	readonly level?: number;
	readonly maxLevel?: number;
	readonly storagePerCorrect?: number;
	readonly escrowPerCorrect?: number;
	readonly storageOnClear?: number;
	readonly storageInterestPct?: number;
	readonly openerCoverageMultiplier?: number;
	readonly missedPollMultiplier?: number;
	readonly throttleCoverageMultiplier?: number;
	readonly fastAnswerWithinMs?: number;
	readonly fastCoverageMultiplier?: number;
	readonly slowCoverageMultiplier?: number;
	readonly cacheHitStep?: number;
	readonly chainStartKb?: number;
	readonly emptySlotDiscountKb?: number;
	readonly abArm?: AbArm;
	readonly peeksCommunitySplit?: boolean;
	readonly storagePerExtraPick?: number;
	readonly coveragePerEstimate?: number;
	readonly wagersAnswer?: number;
	readonly suppressesAudit?: boolean;
	readonly autoUpgradeAfterCorrect?: number;
	readonly coverageDecayPerClear?: number;
	readonly offersFullRoster?: boolean;
	readonly locksOffers?: boolean;
	readonly revealsUpcomingCategories?: boolean;
	readonly reordersGatePolls?: boolean;
	readonly revealsCorrectCount?: boolean;
	readonly draftCostFactor?: number;
	readonly refundsPeeledConfigs?: boolean;
	readonly subscriptionKb?: number;
	readonly subscriptionGrowthPerGate?: number;
	readonly draftCost?: number;
	readonly minified?: boolean;
	readonly vendorLocks?: boolean;
	readonly catchesFatal?: boolean;
	readonly commitsBand?: boolean;
	readonly submitsCrowdPick?: boolean;
	readonly revealsOutageTargets?: boolean;
};

export const minifiedMultiplier = (
	config: Config,
	multiplier: number
): number => (config.minified === true ? 1 + (multiplier - 1) / 2 : multiplier);

export const minifiedAmount = (config: Config, amount: number): number =>
	config.minified === true ? Math.floor(amount / 2) : amount;

export const minifiedUnits = (config: Config, units: number): number =>
	config.minified === true ? units / 2 : units;

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

export const baseSlotsOf = (
	config: Partial<Pick<Config, "id" | "slots" | "minified">>
): number => config.slots ?? 1;

export const slotsOf = (
	config: Partial<Pick<Config, "id" | "slots" | "minified">>
): number =>
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

const hasOpenerEffect = (config: Config): boolean =>
	config.openerCoverageMultiplier !== undefined;

export const openerClashFor = (
	config: Config,
	installed: readonly Config[]
): Config | undefined =>
	hasOpenerEffect(config)
		? installed.find(
				(other) => other.id !== config.id && hasOpenerEffect(other)
			)
		: undefined;

export const isUpgradable = (config: Config): boolean => {
	const upgradable =
		config.focusCategory !== undefined ||
		config.storageOnClear !== undefined ||
		config.storageInterestPct !== undefined ||
		config.peeksCommunitySplit === true ||
		config.reordersGatePolls === true ||
		config.autoUpgradeAfterCorrect !== undefined ||
		config.coverageAdd !== undefined ||
		config.revealsUpcomingCategories === true ||
		config.eliminatesWrongOptionsFor !== undefined;
	return upgradable && (config.level ?? 1) < maxLevelOf(config);
};

export const atFirstVersion = (config: Config): Config =>
	(config.level ?? 1) === 1 ? config : { ...config, level: 1 };

export const levelUp = (config: Config): Config => ({
	...config,
	level: (config.level ?? 1) + 1,
});

export const autoUpgradeAfterCorrectOf = (
	config: Config
): number | undefined =>
	config.autoUpgradeAfterCorrect === undefined
		? undefined
		: Math.max(1, config.autoUpgradeAfterCorrect - ((config.level ?? 1) - 1));

const SAMPLE_SIZE_LEVEL = 2;

export const showsSampleSize = (config: Config): boolean =>
	(config.level ?? 1) >= SAMPLE_SIZE_LEVEL;

const ANSWER_TYPE_LEVEL = 2;

export const showsAnswerTypes = (config: Config): boolean =>
	(config.level ?? 1) >= ANSWER_TYPE_LEVEL;

const POLL_SHAPE_LEVEL = 2;

export const showsPollShape = (config: Config): boolean =>
	(config.level ?? 1) >= POLL_SHAPE_LEVEL;

const LINT_RESET_LEVEL = 2;

export const lintResetsEachGate = (config: Config): boolean =>
	(config.level ?? 1) >= LINT_RESET_LEVEL;

const LINT_HALF_PRICE_LEVEL = 3;
const HALF_PRICE = 0.5;

export const lintsAtHalfPrice = (config: Config): boolean =>
	(config.level ?? 1) >= LINT_HALF_PRICE_LEVEL;

export const lintFeeFactorOf = (config: Config): number =>
	lintsAtHalfPrice(config) ? HALF_PRICE : 1;

export const interestPctOf = (config: Config): number =>
	minifiedAmount(
		config,
		(config.storageInterestPct ?? 0) * (config.level ?? 1)
	);

export const storageOnClearOf = (config: Config): number | undefined =>
	config.storageOnClear === undefined
		? undefined
		: minifiedAmount(config, config.storageOnClear * (config.level ?? 1));

const HUNDREDTHS = 100;

export const coverageAddOf = (config: Config): number | undefined =>
	config.coverageAdd === undefined
		? undefined
		: minifiedUnits(
				config,
				Math.round(config.coverageAdd * (config.level ?? 1) * HUNDREDTHS) /
					HUNDREDTHS
			);

const categoryNames = (codes: readonly CategoryCode[]): string =>
	codes.map((code) => getCategoryMetadata(code).name).join(" / ");

const ANY_POLL = "any poll";

const lintsEveryCategory = (codes: readonly CategoryCode[]): boolean =>
	CATEGORY_CODES.every((code) => codes.includes(code));

const lintScopeOf = (codes: readonly CategoryCode[]): string =>
	lintsEveryCategory(codes) ? ANY_POLL : `${categoryNames(codes)} polls`;

const LINT_FEE_RULES = {
	carries: "a fee that doubles each use and never resets",
	resets: "a fee that doubles each use and resets each gate",
	half: "half the fee, doubling each use and resetting each gate",
} as const;

const LINT_RULE_WORDS = {
	carries: "fee never resets",
	resets: "fee resets each gate",
	half: "half the fee",
} as const;

type LintFeeRule = keyof typeof LINT_FEE_RULES;

const lintFeeRuleOf = (config: Config): LintFeeRule => {
	if (lintsAtHalfPrice(config)) return "half";
	if (lintResetsEachGate(config)) return "resets";
	return "carries";
};

const POLL_SHAPE_WORDS = {
	polls: "categories",
	shape: "with option counts and answer types",
} as const;

const pollShapeWordOf = (config: Config): string =>
	showsPollShape(config) ? POLL_SHAPE_WORDS.shape : POLL_SHAPE_WORDS.polls;

export const describeConfig = (config: Config): string => {
	if (config.wagersAnswer !== undefined)
		return `Arm it before you answer. An exact answer earns +${config.wagersAnswer} units; a partial, a miss or a timeout takes ${config.wagersAnswer} units off the gate. It disarms after every answer.`;
	if (config.coverageDecayPerClear !== undefined)
		return `All coverage earns ×${config.coverageMultiplier}, fading ×${config.coverageDecayPerClear} each gate clear. ${POOLED_BONUS_NOTE} Below ×1 it cuts coverage instead of paying it. Deleted at ×0.`;
	if (config.autoUpgradeAfterCorrect !== undefined)
		return `${autoUpgradeAfterCorrectOf(config)} correct answers in a row upgrade a random config in your build, free. A wrong answer or a failed gate starts the count over.`;
	if (config.peeksCommunitySplit)
		return showsSampleSize(config)
			? "Pay a doubling fee to see how the community answered this poll, and how many answered."
			: "Pay a doubling fee to see how the community answered this poll.";
	if (config.storageInterestPct !== undefined)
		return `+${interestPctOf(config)}% of held storage on gate clear.`;
	if (config.storageOnClear !== undefined)
		return `+${storageOnClearOf(config)}KB storage on gate clear.`;
	if (config.eliminatesWrongOptionsFor !== undefined)
		return `Cross out a wrong answer on ${lintScopeOf(config.eliminatesWrongOptionsFor)} for ${LINT_FEE_RULES[lintFeeRuleOf(config)]}.`;
	if (config.revealsUpcomingCategories === true)
		return showsPollShape(config)
			? "Shows the category, option count and answer type of every poll left this gate, plus all of the next gate's categories."
			: "Shows the category of every poll left this gate, plus all of the next gate's categories.";
	const add = coverageAddOf(config);
	if (add !== undefined)
		return `Every correct answer pays +${add} units of coverage. No other config multiplies it; only the gate's accuracy does.`;
	if (!config.focusCategory) return config.description;
	const name = getCategoryMetadata(config.focusCategory).name;
	return `${name} polls earn ${focusMultiplierOf(config)}× coverage.`;
};

export type UpgradeChange = {
	readonly from: string;
	readonly to: string;
};

export const upgradePreview = (
	config: Config,
	next: Config = levelUp(config)
): readonly UpgradeChange[] =>
	[
		...(config.autoUpgradeAfterCorrect === undefined
			? []
			: [
					{
						from: `${autoUpgradeAfterCorrectOf(config)} in a row`,
						to: `${autoUpgradeAfterCorrectOf(next)} in a row`,
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
		...(config.reordersGatePolls === true
			? [
					{
						from: showsAnswerTypes(config) ? "with answer types" : "categories",
						to: showsAnswerTypes(next) ? "with answer types" : "categories",
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
		...(config.coverageAdd === undefined
			? []
			: [
					{
						from: `+${coverageAddOf(config)} units`,
						to: `+${coverageAddOf(next)} units`,
					},
				]),
		...(config.revealsUpcomingCategories === true
			? [{ from: pollShapeWordOf(config), to: pollShapeWordOf(next) }]
			: []),
		...(config.eliminatesWrongOptionsFor === undefined
			? []
			: [
					{
						from: LINT_RULE_WORDS[lintFeeRuleOf(config)],
						to: LINT_RULE_WORDS[lintFeeRuleOf(next)],
					},
				]),
	].filter((change) => change.from !== change.to);

export type ConfigFigure =
	| { readonly kind: "multiplier"; readonly value: number }
	| { readonly kind: "coverage"; readonly value: number }
	| { readonly kind: "kb"; readonly value: number }
	| { readonly kind: "percent"; readonly value: number };

export const headlineFigureOf = (config: Config): ConfigFigure | undefined => {
	if (config.wagersAnswer !== undefined)
		return { kind: "coverage", value: config.wagersAnswer };
	if (config.focusCategory)
		return { kind: "multiplier", value: focusMultiplierOf(config) };
	if (config.coverageMultiplier !== undefined)
		return {
			kind: "multiplier",
			value: minifiedMultiplier(config, config.coverageMultiplier),
		};
	const add = coverageAddOf(config);
	if (add !== undefined) return { kind: "coverage", value: add };
	if (config.storagePerCorrect !== undefined)
		return {
			kind: "kb",
			value: minifiedAmount(config, config.storagePerCorrect),
		};
	if (config.chainStartKb !== undefined)
		return { kind: "kb", value: minifiedAmount(config, config.chainStartKb) };
	if (config.emptySlotDiscountKb !== undefined)
		return {
			kind: "kb",
			value: minifiedAmount(config, config.emptySlotDiscountKb),
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

	return undefined;
};

export const givesOf = (config: Config): string | undefined => {
	if (config.wagersAnswer !== undefined)
		return `+${config.wagersAnswer} units on an exact answer, when armed`;
	if (config.coverageDecayPerClear !== undefined)
		return `All coverage earns ×${config.coverageMultiplier}, fading ×${config.coverageDecayPerClear} per clear`;
	if (config.autoUpgradeAfterCorrect !== undefined)
		return `A free random config upgrade every ${autoUpgradeAfterCorrectOf(config)} correct answers in a row`;
	if (config.peeksCommunitySplit)
		return showsSampleSize(config)
			? "See how the community answered, and how many answered"
			: "See how the community answered this poll";
	if (config.storageInterestPct !== undefined)
		return `+${interestPctOf(config)}% of held storage on clear`;
	if (config.storageOnClear !== undefined)
		return `+${storageOnClearOf(config)}KB on clear`;
	if (config.eliminatesWrongOptionsFor !== undefined)
		return `Cross out a wrong answer on ${lintScopeOf(config.eliminatesWrongOptionsFor)}`;
	if (config.revealsUpcomingCategories === true)
		return showsPollShape(config)
			? "The categories, option counts and answer types of this gate's remaining polls, and the next gate's categories"
			: "The categories of this gate's remaining polls, and the next gate's";
	const add = coverageAddOf(config);
	if (add !== undefined) return `+${add} units on every correct answer`;
	if (!config.focusCategory) return config.gives;
	const name = getCategoryMetadata(config.focusCategory).name;
	return `${name} polls reward ×${focusMultiplierOf(config)} coverage`;
};

export const POOLED_BONUS_NOTE =
	"Adds to other all-coverage bonuses, never multiplies them.";

const AB_COVERAGE_MULTIPLIER = 1.25;
const AB_STORAGE_PER_CORRECT = 8;

export const AB_ARMS = {
	coverage: {
		coverageMultiplier: AB_COVERAGE_MULTIPLIER,
		storagePerCorrect: undefined,
		description: `Arm A is live — all coverage earns ×${AB_COVERAGE_MULTIPLIER}. ${POOLED_BONUS_NOTE} Arm B holds +${AB_STORAGE_PER_CORRECT}KB per correct answer.`,
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

export const cacheUnitsFor = (config: Config, cachedHits: number): number =>
	config.cacheHitStep === undefined || cachedHits <= 0
		? 0
		: minifiedUnits(
				config,
				config.cacheHitStep * Math.min(cachedHits, CACHE_HIT_CAP)
			);

export const topUpUnitsFor = (config: Config, creditedUnits: number): number =>
	config.roundsPartialUnitsUp === true
		? minifiedUnits(config, Math.ceil(creditedUnits) - creditedUnits)
		: 0;

export const emptySlotCreditPerSlotKb = (configs: readonly Config[]): number =>
	configs.reduce(
		(sum, config) =>
			sum + minifiedAmount(config, config.emptySlotDiscountKb ?? 0),
		0
	);

export const faucetKbPerCorrect = (configs: readonly Config[]): number =>
	configs.reduce(
		(sum, config) =>
			sum + minifiedAmount(config, config.storagePerCorrect ?? 0),
		0
	);

export const chainKbFor = (
	configs: readonly Config[],
	links: number
): number =>
	links <= 0
		? 0
		: configs.reduce(
				(sum, config) =>
					sum +
					minifiedAmount(config, (config.chainStartKb ?? 0) * 2 ** (links - 1)),
				0
			);

export const escrowKbPerCorrect = (configs: readonly Config[]): number =>
	configs.reduce(
		(sum, config) => sum + minifiedAmount(config, config.escrowPerCorrect ?? 0),
		0
	);

import type { CategoryCode } from "~/domains/shared/categories";
import { getCategoryMetadata } from "~/domains/shared/categories";

export type ConfigFamily =
	"focus" | "defense" | "risk" | "amplify" | "economy" | "check";

export type CheckKind = "coverage-gain" | "cold-start" | "correct";

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type Config = {
	readonly id: string;
	readonly label: string;
	readonly family: ConfigFamily;
	readonly rarity?: Rarity;
	readonly description: string;
	readonly requirementDelta: number;
	readonly rewardMultiplier: number;
	readonly focusCategory?: CategoryCode;
	readonly eliminatesWrongOptionsFor?: readonly CategoryCode[];
	readonly coverageMultiplier?: number;
	readonly coverageAdd?: number;
	readonly level?: number;
	readonly storagePerCorrect?: number;
	readonly check?: CheckKind;
	readonly checkAmount?: number;
	readonly fixed?: boolean;
};

export const rarityOf = (config: Config): Rarity => config.rarity ?? "common";

export const focusCoverageMultiplier = (level: number): number =>
	1 + 0.5 * level;

export const focusDemand = (config: Config): number => config.level ?? 1;

const UPGRADE_COST_PER_LEVEL = 60;

export const upgradeCost = (currentLevel: number): number =>
	UPGRADE_COST_PER_LEVEL * currentLevel;

export const upgradeCoverageRequired = (currentLevel: number): number =>
	currentLevel * 5;

const DRAFT_COST: Record<Rarity, number> = {
	common: 20,
	uncommon: 40,
	rare: 80,
	legendary: 160,
};

export const draftCost = (config: Config): number =>
	DRAFT_COST[rarityOf(config)];

/** Storage returned on selling a config — half its draft cost (market value). */
export const sellRefund = (config: Config): number =>
	Math.floor(draftCost(config) / 2);

export const isUpgradable = (config: Config): boolean =>
	config.focusCategory !== undefined || config.check === "correct";

export const describeConfig = (config: Config): string => {
	if (config.check === "correct") {
		const level = config.level ?? 1;
		const answers = `${level} correct answer${level === 1 ? "" : "s"}`;
		return level > 1
			? `Requires ${answers} to pass the gate — pays ${level}× storage.`
			: `Requires ${answers} to pass the gate.`;
	}
	if (!config.focusCategory) return config.description;
	const name = getCategoryMetadata(config.focusCategory).name;
	const level = config.level ?? 1;
	return `${name} polls earn ${focusCoverageMultiplier(level)}× coverage — but if ${name} shows, you must get ${level} right.`;
};

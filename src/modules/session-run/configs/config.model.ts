import type { CategoryCode } from "~/domains/shared/categories";
import { getCategoryMetadata } from "~/domains/shared/categories";

export type ConfigFamily =
	"focus" | "defense" | "risk" | "amplify" | "economy" | "check";

export type CheckKind = "coverage-gain" | "cold-start";

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
};

export const rarityOf = (config: Config): Rarity => config.rarity ?? "common";

export const focusCoverageMultiplier = (level: number): number =>
	1 + 0.5 * level;

export const focusDemand = (config: Config): number => config.level ?? 1;

/** Storage (KB) to level a focus config up from its current level. Climbs so deeper mastery costs more. */
export const upgradeCost = (currentLevel: number): number => 60 * currentLevel;

/** The config's description at its *current* level. Focus configs scale with level; others are static. */
export const describeConfig = (config: Config): string => {
	if (!config.focusCategory) return config.description;
	const name = getCategoryMetadata(config.focusCategory).name;
	const level = config.level ?? 1;
	return `${name} polls earn ${focusCoverageMultiplier(level)}× coverage — but if ${name} shows, you must get ${level} right.`;
};

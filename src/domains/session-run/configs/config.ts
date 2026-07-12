import type { CategoryCode } from "~/domains/shared/categories";

export type ConfigFamily =
	"focus" | "defense" | "risk" | "amplify" | "economy" | "check";

export type CheckKind = "coverage-gain" | "cold-start" | "speed";

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
	readonly immuneToRaise?: boolean;
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

import type { CategoryCode } from "~/shared/lib/categories";

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type DemoConfig = {
	id: string;
	name: string;
	image?: string;
	cost: number;
	effect: string[];
	description: string;
	rarity: Rarity;
	targetCategories?: CategoryCode[];
	priority: number;
	coverageBonus?: number;
	categoryWeightBonus?: number;
	storageBonus?: number;
};

export type DemoCategoryCoverage = {
	categoryCode: CategoryCode;
	currentCoverage: number;
	currentStreak: number;
	bestStreak: number;
	pollsAnswered: number;
	correctPollsAnswered: number;
};

export const demoCoverage = (
	overrides: Partial<DemoCategoryCoverage> &
		Pick<DemoCategoryCoverage, "categoryCode">
): DemoCategoryCoverage => ({
	currentCoverage: 0,
	currentStreak: 0,
	bestStreak: 0,
	pollsAnswered: 0,
	correctPollsAnswered: 0,
	...overrides,
});

export const DEFAULT_WINDOW_SIZE = 5;

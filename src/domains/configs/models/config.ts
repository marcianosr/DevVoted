import { RunCategoryXp } from "~/domains/runs/models/runCategoryXp";
import { Run } from "~/domains/runs/models/run";
import { CategoryCode } from "~/domains/shared/categories";

export type ConfigEffectContext = {
	run: Run;
	categoryXp: RunCategoryXp[];
	currentStreak: number;
	pollsAnswered: number;
	correctAnswers: number;
};

export type Config = {
	id: string;
	name: string;
	image?: string; // Optional image URL or path
	cost: number; // Storage cost in bytes
	effect: string[];
	description: string;
	unlockCriteria?: {
		requiredXP?: number;
		requiredCategory?: string;
		requiredStreak?: number;
		requiredPollsAnswered?: number;
	};
	rarity: "common" | "uncommon" | "rare" | "legendary";
	targetCategories?: CategoryCode[]; // Categories this config can target, e.g., ["js", "python"], if empty it targets all categories
	priority: number;
};

export type ConfigInventory = {
	configs: Config[];
	storageUsed: number;
	storageLimit: number;
};

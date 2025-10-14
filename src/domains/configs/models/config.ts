import { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";
import { Run } from "~/domains/runs/models/run";
import { CategoryCode } from "~/domains/shared/categories";

export type ConfigEffectContext = {
	run: Run;
	categoryCoverage: RunCategoryCoverage[];
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
		requiredCoverage?: number;
		requiredCategory?: string;
		requiredStreak?: number;
		requiredPollsAnswered?: number;
	};
	rarity: "common" | "uncommon" | "rare" | "legendary";
	targetCategories?: CategoryCode[]; // Categories this config can target, e.g., ["js", "python"], if empty it targets all categories
	priority: number;
	storageBonus?: number; // Optional: Amount of storage this config adds (in bytes)
};

export type ConfigInventory = {
	configs: Config[];
	storageUsed: number;
	storageLimit: number;
};

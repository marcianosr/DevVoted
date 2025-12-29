import { Run } from "~/domains/runs/models/run";
import { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";
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
	coverageBonus?: number; // Optional: Flat coverage bonus this config provides (in percentage points, e.g., 0.5 for +0.5%)
	reductionCost?: number; // Optional: Cost reduction percentage (e.g., 10 for 10%)
	multiplier?: boolean; // Optional: Whether coverageBonus is a multiplier
	storagePerCorrect?: number; // Optional: Storage bonus per correct poll (in bytes)
	maxStorageBonus?: number; // Optional: Maximum storage bonus cap (in bytes)
};

export type ConfigInventory = {
	configs: Config[];
	storageUsed: number;
	storageLimit: number;
};

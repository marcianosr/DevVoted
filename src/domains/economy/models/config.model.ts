import { Run } from "~/domains/runs/models/run.model";
import { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage.model";
import { CategoryCode } from "~/shared/lib/categories";

export type ConfigEffectContext = {
	run: Run;
	categoryCoverage: RunCategoryCoverage[];
	currentStreak: number;
	pollsAnswered: number;
	correctAnswers: number;
};

export type ConfigVariant = {
	id: string; // Real config id that will be installed when chosen
	label: string;
	description: string;
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
	categoryWeightBonus?: number; // Optional: Weight bonus for poll category selection (e.g., 0.25 for +25% chance)
	showNextConfigs?: boolean;
	// Shell config that opens a variant picker on install. The chosen variant's id
	// is what gets stored in activeConfigIds — the shell itself is never installed.
	variants?: ConfigVariant[];
	// Marks this config as a variant target reachable only through a shell card.
	// Variants are filtered out of shop offerings so they can only be installed via their shell.
	variantOf?: string;
};

export type ConfigInventory = {
	configs: Config[];
	storageUsed: number;
	storageLimit: number;
};

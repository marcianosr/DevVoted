import { RunCategoryXP } from "~/domains/runs/models/runCategoryXp";
import { Run } from "~/domains/runs/models/run";

export type ConfigEffectContext = {
	run: Run;
	categoryXp: RunCategoryXP[];
	currentStreak: number;
	pollsAnswered: number;
	correctAnswers: number;
};

export type ConfigEffect = (context: ConfigEffectContext) => void;

export type Config = {
	id: string;
	name: string;
	image?: string; // Optional image URL or path
	cost: number; // Storage cost in bytes
	cooldown: number; // Cooldown in number of polls
	effect: ConfigEffect;
	description: string;
	unlockCriteria?: {
		requiredXp?: number;
		requiredCategory?: string;
		requiredStreak?: number;
		requiredPollsAnswered?: number;
	};
	synergies?: string[]; // IDs of configs that synergize with this one
	rarity: "common" | "uncommon" | "rare" | "legendary";
};

export type ConfigInstance = {
	config: Config;
	lastUsed: number; // Poll number when last used
	isOnCooldown: boolean;
};

export type ConfigInventory = {
	configs: ConfigInstance[];
	storageUsed: number;
	storageLimit: number;
};
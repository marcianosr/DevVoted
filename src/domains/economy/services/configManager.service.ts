import { configs, applyEffects } from "~/domains/configs/data/configs";
import { Config } from "~/domains/configs/models/config";
import { Run } from "~/domains/runs/models/run";
import { getStorageUsagePercentage, canAddToStorage } from "~/lib/storage";

export const getActiveConfigs = (
	run: Run,
	availableConfigs: Config[] = configs
): Config[] => {
	return run.activeConfigIds
		.map((id) => availableConfigs.find((config) => config.id === id))
		.filter((config): config is Config => config !== undefined);
};

export const calculateStorageUsed = (activeConfigs: Config[]): number => {
	return activeConfigs.reduce((total, config) => total + config.cost, 0);
};

/**
 * Calculates the effective storage limit including bonuses from configs.
 * Similar to how amp bonuses work for scoring.
 *
 * @param run - The current run with active configs
 * @returns Total storage capacity (base + bonuses)
 */
export const calculateEffectiveStorageLimit = (run: Run): number => {
	const baseStorage = run.storageLimit;

	// Apply config effects to get storage modifiers
	// Using a minimal context since storage doesn't depend on poll data
	const { storage } = applyEffects(
		{ poll: {} as any, options: [], hasAnswered: false, run },
		run.activeConfigIds
	);

	// Add passive storage expansion from configs (e.g., "Local Storage" config)
	return baseStorage + (storage.expand ?? 0);
};

export const getStorageInfo = (
	run: Run,
	availableConfigs: Config[] = configs
) => {
	const activeConfigs = getActiveConfigs(run, availableConfigs);
	const configsStorage = calculateStorageUsed(activeConfigs);
	const rerollsStorage = run.rerollStorageUsed;

	// Calculate effective storage limit with bonuses from configs
	const effectiveStorageLimit = calculateEffectiveStorageLimit(run);

	const storageUsed = configsStorage + rerollsStorage + run.deinstallPenalty;
	const storageAvailable = effectiveStorageLimit - storageUsed;
	const usagePercentage = getStorageUsagePercentage(
		storageUsed,
		effectiveStorageLimit
	);

	return {
		activeConfigs,
		configsStorage,
		rerollsStorage,
		storageUsed,
		storageAvailable,
		storageLimit: effectiveStorageLimit, // Use effective limit with bonuses
		baseStorageLimit: run.storageLimit, // Keep base for reference
		usagePercentage,
	};
};

export const canAddConfigToRun = (
	run: Run,
	config: Config,
	availableConfigs: Config[] = configs,
	costReduction: number = 0
): boolean => {
	if (run.activeConfigIds.includes(config.id)) {
		return false; // Already has this config
	}

	const { storageUsed, storageLimit } = getStorageInfo(run, availableConfigs);
	const discountedCost = Math.floor(config.cost * (1 - costReduction));
	// Use effective storage limit (with bonuses) for validation
	return canAddToStorage(storageUsed, discountedCost, storageLimit);
};

export const addConfigsToRun = (
	run: Run,
	configIds: string[],
	availableConfigs: Config[] = configs
): Run => {
	// Filter out configs that are already in the run
	const newConfigIds = configIds.filter(
		(id) => !run.activeConfigIds.includes(id)
	);

	if (newConfigIds.length === 0) {
		return run; // No new configs to add
	}

	// Check if all new configs exist and can be added
	const allConfigsValid = newConfigIds.every((configId) => {
		const config = availableConfigs.find((c) => c.id === configId);
		return config && canAddConfigToRun(run, config, availableConfigs);
	});

	if (!allConfigsValid) {
		return run; // Some config not found or not enough storage
	}

	return {
		...run,
		activeConfigIds: [...run.activeConfigIds, ...newConfigIds],
	};
};

export const removeConfigsFromRun = (run: Run, configIds: string[]): Run => ({
	...run,
	activeConfigIds: run.activeConfigIds.filter((id) => !configIds.includes(id)),
});

export const hasConfig = (run: Run, configId: string) =>
	run.activeConfigIds.find((aId) => configId === aId);

/**
 * Rarity weights determine the relative probability of each rarity tier appearing.
 * Higher weight = more likely to appear
 */
const RARITY_WEIGHTS = {
	common: 100, // 100/145 ≈ 69% chance
	uncommon: 30, // 30/145 ≈ 21% chance
	rare: 12, // 12/145 ≈ 8% chance
	legendary: 3, // 3/145 ≈ 2% chance
} as const;

/**
 * Creates a seeded random number generator.
 * Uses mulberry32 algorithm — fast, good distribution, deterministic.
 */
const createSeededRandom = (seed: number) => {
	let state = seed;
	return () => {
		state |= 0;
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

/**
 * Simple string hash for seed generation.
 */
const hashString = (str: string): number => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}
	return Math.abs(hash);
};

type WeightedConfig = {
	config: Config;
	weight: number;
	cumulativeWeight: number;
};

/**
 * Creates weighted config entries with cumulative weights for efficient selection
 */
const createWeightedConfigs = (configs: Config[]): WeightedConfig[] => {
	let cumulativeWeight = 0;

	return configs.map((config) => {
		const weight = RARITY_WEIGHTS[config.rarity];
		cumulativeWeight += weight;
		return {
			config,
			weight,
			cumulativeWeight,
		};
	});
};

/**
 * Selects a config using binary search on cumulative weights
 */
const selectByWeight = (
	weightedConfigs: WeightedConfig[],
	randomValue: number
): Config => {
	const selected = weightedConfigs.find(
		(weighted) => randomValue <= weighted.cumulativeWeight
	);
	return selected?.config ?? weightedConfigs[0].config;
};

/**
 * Performs weighted random selection without replacement
 */
const performWeightedSelection = (
	configs: Config[],
	count: number,
	random: () => number
): Config[] => {
	if (configs.length === 0) return [];

	const selected: Config[] = [];
	let remainingConfigs = [...configs];

	for (let i = 0; i < count && remainingConfigs.length > 0; i++) {
		const weightedConfigs = createWeightedConfigs(remainingConfigs);
		const totalWeight =
			weightedConfigs[weightedConfigs.length - 1].cumulativeWeight;
		const randomValue = random() * totalWeight;

		const selectedConfig = selectByWeight(weightedConfigs, randomValue);
		selected.push(selectedConfig);

		// Remove selected config for next iteration (no replacement)
		remainingConfigs = remainingConfigs.filter(
			(c) => c.id !== selectedConfig.id
		);
	}

	return selected;
};

/**
 * Gets random configs for the shop using a seeded RNG.
 * Same run + same totalRerolls = same offered configs.
 * Configs only change when user pays to reroll (increments totalRerolls).
 *
 * Selection is deterministic from the full pool, then filtered to exclude
 * already-owned configs. This ensures installing a config just removes it
 * from the offer without shifting the other selections.
 */
export const getRandomConfigs = ({
	run,
	configs,
	count,
}: {
	run: Run;
	configs: Config[];
	count: number;
}): Config[] => {
	const seed = hashString(`${run.id}-${run.totalRerolls}`);
	const random = createSeededRandom(seed);

	const availableConfigs = configs.filter((c) => !hasConfig(run, c.id));
	return performWeightedSelection(availableConfigs, count, random);
};

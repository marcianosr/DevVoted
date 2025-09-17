import { Run } from "~/domains/runs/models/run";
import { Config } from "~/domains/configs/models/config";
import { configs, applyEffects } from "~/domains/configs/data/configs";
import { getStorageUsagePercentage, canAddToStorage } from "~/lib/storage";

export const getActiveConfigs = (run: Run, availableConfigs: Config[] = configs): Config[] => {
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
	
	// Add bonus storage from configs to base storage
	return baseStorage + (storage.bonus ?? 0);
};

export const getStorageInfo = (run: Run, availableConfigs: Config[] = configs) => {
	const activeConfigs = getActiveConfigs(run, availableConfigs);
	const configsStorage = calculateStorageUsed(activeConfigs);
	const rerollsStorage = run.rerollStorageUsed;
	
	// Calculate effective storage limit with bonuses from configs
	const effectiveStorageLimit = calculateEffectiveStorageLimit(run);

	const storageUsed = configsStorage + rerollsStorage;
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
		baseStorageLimit: run.storageLimit,  // Keep base for reference
		usagePercentage,
	};
};

export const canAddConfigToRun = (run: Run, config: Config, availableConfigs: Config[] = configs): boolean => {
	if (run.activeConfigIds.includes(config.id)) {
		return false; // Already has this config
	}

	const { storageUsed, storageLimit } = getStorageInfo(run, availableConfigs);
	// Use effective storage limit (with bonuses) for validation
	return canAddToStorage(storageUsed, config.cost, storageLimit);
};

export const addConfigsToRun = (run: Run, configIds: string[], availableConfigs: Config[] = configs): Run => {
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
	activeConfigIds: run.activeConfigIds.filter(
		(id) => !configIds.includes(id)
	),
});

export const hasConfig = (run: Run, configId: string) =>
	run.activeConfigIds.find((aId) => configId === aId);

export const getRandomConfigs = ({
	run,
	configs,
	count,
}: {
	run: Run;
	configs: Config[];
	count: number;
}): Config[] => {
	const filteredConfigs = configs.filter((c) => !hasConfig(run, c.id));

	const shuffled = [...filteredConfigs].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
};

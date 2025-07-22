import { Run } from "~/domains/runs/models/run";
import { Config } from "~/domains/configs/models/config";
import { configs } from "~/domains/configs/data/configs";
import { getStorageUsagePercentage, canAddToStorage } from "~/lib/storage";

export const getActiveConfigs = (run: Run): Config[] => {
	return run.activeConfigIds
		.map((id) => configs.find((config) => config.id === id))
		.filter((config): config is Config => config !== undefined);
};

export const calculateStorageUsed = (activeConfigs: Config[]): number => {
	return activeConfigs.reduce((total, config) => total + config.cost, 0);
};

export const getStorageInfo = (run: Run) => {
	const activeConfigs = getActiveConfigs(run);
	const storageUsed = calculateStorageUsed(activeConfigs);
	const storageAvailable = run.storageLimit - storageUsed;
	const usagePercentage = getStorageUsagePercentage(
		storageUsed,
		run.storageLimit
	);

	return {
		activeConfigs,
		storageUsed,
		storageAvailable,
		storageLimit: run.storageLimit,
		usagePercentage,
	};
};

export const canAddConfigToRun = (run: Run, config: Config): boolean => {
	if (run.activeConfigIds.includes(config.id)) {
		return false; // Already has this config
	}

	const currentStorageUsed = calculateStorageUsed(getActiveConfigs(run));
	return canAddToStorage(currentStorageUsed, config.cost, run.storageLimit);
};

export const addConfigsToRun = (run: Run, configIds: string[]): Run => {
	// Filter out configs that are already in the run
	const newConfigIds = configIds.filter(
		(id) => !run.activeConfigIds.includes(id)
	);

	if (newConfigIds.length === 0) {
		return run; // No new configs to add
	}

	// Check if all new configs exist and can be added
	const allConfigsValid = newConfigIds.every((configId) => {
		const config = configs.find((c) => c.id === configId);
		return config && canAddConfigToRun(run, config);
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

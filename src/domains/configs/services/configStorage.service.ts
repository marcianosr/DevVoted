import { Run } from "~/domains/runs/models/run";
import { Config } from "~/domains/configs/models/config";
import { configs } from "~/domains/configs/data/configs";
import { getStorageUsagePercentage, canAddToStorage } from "~/lib/storage";

export const getActiveConfigs = (run: Run): Config[] => {
	return run.activeConfigIds
		.map(id => configs.find(config => config.id === id))
		.filter((config): config is Config => config !== undefined);
};

export const calculateStorageUsed = (activeConfigs: Config[]): number => {
	return activeConfigs.reduce((total, config) => total + config.cost, 0);
};

export const getStorageInfo = (run: Run) => {
	const activeConfigs = getActiveConfigs(run);
	const storageUsed = calculateStorageUsed(activeConfigs);
	const storageAvailable = run.storageLimit - storageUsed;
	const usagePercentage = getStorageUsagePercentage(storageUsed, run.storageLimit);

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

export const addConfigToRun = (run: Run, configId: string): Run => {
	if (run.activeConfigIds.includes(configId)) {
		return run; // Already has this config
	}

	const config = configs.find(c => c.id === configId);
	if (!config || !canAddConfigToRun(run, config)) {
		return run; // Config not found or not enough storage
	}

	return {
		...run,
		activeConfigIds: [...run.activeConfigIds, configId],
	};
};

export const removeConfigFromRun = (run: Run, configId: string): Run => {
	return {
		...run,
		activeConfigIds: run.activeConfigIds.filter(id => id !== configId),
	};
};

export const getAvailableConfigs = (run: Run): Config[] => {
	return configs.filter(config => !run.activeConfigIds.includes(config.id));
};
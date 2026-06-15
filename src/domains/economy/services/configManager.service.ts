import { configs, applyEffects } from "~/domains/economy/data/configs";
import { Config } from "~/domains/economy/models/config.model";
import { Run } from "~/domains/runs/models/run.model";
import { TECH_DEBT_DISCOUNT_RATIO } from "~/domains/techDebt/config";
import { getStorageUsagePercentage, canAddToStorage } from "~/lib/storage";

// Player gets back REFUND_RATE * cost on deinstall; the rest becomes a penalty.
export const REFUND_RATE = 0.5;
export const calculateRefund = (cost: number): number =>
	Math.round(cost * REFUND_RATE);

import { previewNextShopOfferings } from "./configSelection";

export const getActiveConfigs = (
	run: Run,
	availableConfigs: Config[] = configs
): Config[] => {
	return run.activeConfigIds
		.map((id) => availableConfigs.find((config) => config.id === id))
		.filter((config): config is Config => config !== undefined);
};

/**
 * Sums storage cost across configs, applying the Tech Debt discount ratio to
 * any config whose id is in discountedConfigIds. Discounted configs were
 * purchased via the shop's TD-trade variant — they paid storage at the
 * reduced rate and the player took on a Tech Debt in exchange.
 */
export const calculateStorageUsed = (
	activeConfigs: Config[],
	discountedConfigIds: string[] = []
): number => {
	const discountedSet = new Set(discountedConfigIds);
	return activeConfigs.reduce((total, config) => {
		const effectiveCost = discountedSet.has(config.id)
			? Math.floor(config.cost * TECH_DEBT_DISCOUNT_RATIO)
			: config.cost;
		return total + effectiveCost;
	}, 0);
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
	const configsStorage = calculateStorageUsed(
		activeConfigs,
		run.discountedConfigIds
	);
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

// True if the run holds this config — or, for a shell config with variants,
// holds any of its variants.
export const isConfigInstalled = (run: Run, config: Config): boolean => {
	if (run.activeConfigIds.includes(config.id)) return true;
	const variantIds = config.variants?.map((v) => v.id) ?? [];
	return variantIds.some((id) => run.activeConfigIds.includes(id));
};

export const canAddConfigToRun = (
	run: Run,
	config: Config,
	availableConfigs: Config[] = configs,
	costReduction: number = 0
): boolean => {
	if (isConfigInstalled(run, config)) {
		return false; // Already has this config (or one of its variants)
	}

	const { storageUsed, storageLimit } = getStorageInfo(run, availableConfigs);
	const discountedCost = Math.floor(config.cost * (1 - costReduction));
	// Use effective storage limit (with bonuses) for validation
	return canAddToStorage(storageUsed, discountedCost, storageLimit);
};

/**
 * Pre-purchase check for the Tech Debt discount variant: charges the config
 * at TECH_DEBT_DISCOUNT_RATIO * cost. Soft-cap and pool-availability
 * enforcement live in the Tech Debt acquire service — this check only
 * answers "does the run have room for a discounted cost".
 */
export const canAddDiscountedConfigToRun = (
	run: Run,
	config: Config,
	availableConfigs: Config[] = configs
): boolean =>
	canAddConfigToRun(
		run,
		config,
		availableConfigs,
		1 - TECH_DEBT_DISCOUNT_RATIO
	);

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

/**
 * Like addConfigsToRun, but marks the new ids as discount-purchased — their
 * storage cost will be applied at TECH_DEBT_DISCOUNT_RATIO going forward.
 *
 * Storage validation uses the discounted cost so a config that wouldn't fit
 * at full price may still be purchasable here. Acquiring the Tech Debt is
 * the caller's responsibility — this function does not spawn it.
 */
export const addDiscountedConfigsToRun = (
	run: Run,
	configIds: string[],
	availableConfigs: Config[] = configs
): Run => {
	const newConfigIds = configIds.filter(
		(id) => !run.activeConfigIds.includes(id)
	);

	if (newConfigIds.length === 0) return run;

	const allConfigsValid = newConfigIds.every((configId) => {
		const config = availableConfigs.find((c) => c.id === configId);
		return config && canAddDiscountedConfigToRun(run, config, availableConfigs);
	});

	if (!allConfigsValid) return run;

	return {
		...run,
		activeConfigIds: [...run.activeConfigIds, ...newConfigIds],
		discountedConfigIds: [...run.discountedConfigIds, ...newConfigIds],
	};
};

export const removeConfigsFromRun = (run: Run, configIds: string[]): Run => ({
	...run,
	activeConfigIds: run.activeConfigIds.filter((id) => !configIds.includes(id)),
});

export const hasConfig = (run: Run, configId: string) =>
	run.activeConfigIds.find((aId) => configId === aId);

type ShopEffects = {
	extraSlot?: boolean;
	reductionCost?: number;
	lockShop?: boolean;
};

/**
 * Preview the next reroll's shop offerings without persisting.
 * Re-exports from shopOfferings.service for backward compatibility.
 */
export const getNextOfferedConfigs = (
	run: Run,
	effects: ShopEffects,
	availableConfigs: Config[] = configs
): (Config & { originalCost?: number })[] => {
	return previewNextShopOfferings(
		run.activeConfigIds,
		effects,
		availableConfigs
	);
};

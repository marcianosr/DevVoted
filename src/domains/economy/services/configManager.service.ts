import { configs, applyEffects } from "~/domains/configs/data/configs";
import { Config } from "~/domains/configs/models/config";
import { withDiscount } from "~/domains/configs/services/discount.service";
import { Run } from "~/domains/runs/models/run";
import {
	selectMultipleWeightedSeededRandom,
	WeightedItem,
} from "~/lib/seededRandom";
import { getStorageUsagePercentage, canAddToStorage } from "~/lib/storage";

const DEFAULT_OFFERED_CONFIGS_COUNT = 3;
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
 * Gets random configs for the shop using a seeded RNG.
 * Same run + same totalRerolls = same offered configs.
 * Configs only change when user pays to reroll (increments totalRerolls).
 *
 * Selection is deterministic from the full pool, then filtered to exclude
 * already-owned configs. This ensures installing a config just removes it
 * from the offer without shifting the other selections.
 *
 * When lockShop is true (yarn.lock config), the date is excluded from the seed,
 * making shop items persist across poll/day changes until the user rerolls.
 */
export const getRandomConfigs = ({
	run,
	configs,
	count,
	lockShop = false,
}: {
	run: Run;
	configs: Config[];
	count: number;
	lockShop?: boolean;
}): Config[] => {
	const today = new Date().toISOString().split("T")[0];
	const seed = lockShop
		? `${run.id}-${run.totalRerolls}`
		: `${run.id}-${run.totalRerolls}-${today}`;

	// Convert configs to weighted items based on rarity
	const weightedConfigs: WeightedItem<Config>[] = configs.map((config) => ({
		item: config,
		weight: RARITY_WEIGHTS[config.rarity],
	}));

	// Select more than needed from FULL pool to ensure we have enough after filtering
	// This keeps selection stable regardless of which configs are already owned
	const selectionPoolSize = Math.min(configs.length, count * 3);
	const selectedFromFullPool = selectMultipleWeightedSeededRandom(
		weightedConfigs,
		selectionPoolSize,
		seed
	);

	// Filter out already-owned configs and take only what we need
	return selectedFromFullPool
		.filter((config) => !hasConfig(run, config.id))
		.slice(0, count);
};

type ShopEffects = {
	extraSlot?: boolean;
	reductionCost?: number;
	lockShop?: boolean;
};

/**
 * Gets offered configs for the shop with discounts applied.
 * Combines config selection and discount logic in one place.
 */
export const getOfferedConfigs = (
	run: Run,
	effects: ShopEffects,
	availableConfigs: Config[] = configs
): (Config & { originalCost?: number })[] => {
	const count = effects.extraSlot
		? DEFAULT_OFFERED_CONFIGS_COUNT + 1
		: DEFAULT_OFFERED_CONFIGS_COUNT;

	const selectedConfigs = getRandomConfigs({
		run,
		configs: availableConfigs,
		count,
		lockShop: effects.lockShop,
	});

	return selectedConfigs.map((config) =>
		withDiscount(config, effects.reductionCost ?? 0)
	);
};

/**
 * Pure config selection logic - no database dependencies.
 * Safe to import from routes and components.
 */
import { configs } from "~/domains/economy/data/configs";
import { Config } from "~/domains/economy/models/config.model";
import { withDiscount } from "~/domains/economy/services/discount.service";

type ConfigRarity = Config["rarity"];

const DEFAULT_OFFERED_CONFIGS_COUNT = 3;

/**
 * Rarity weights determine the relative probability of each rarity tier appearing.
 * Higher weight = more likely to appear.
 * Selection is two-step: first roll rarity, then pick from that rarity pool.
 */
const RARITY_WEIGHTS: Record<ConfigRarity, number> = {
	common: 100, // 100/145 ≈ 69% chance
	uncommon: 30, // 30/145 ≈ 21% chance
	rare: 12, // 12/145 ≈ 8% chance
	legendary: 3, // 3/145 ≈ 2% chance
};

const RARITIES: ConfigRarity[] = ["common", "uncommon", "rare", "legendary"];

export type ShopEffects = {
	extraSlot?: boolean;
	reductionCost?: number;
	lockShop?: boolean;
};

/**
 * Roll a rarity tier based on weights.
 * Returns one of: common, uncommon, rare, legendary
 */
const rollRarity = (): ConfigRarity => {
	const totalWeight = Object.values(RARITY_WEIGHTS).reduce(
		(sum, w) => sum + w,
		0
	);
	const roll = Math.random() * totalWeight;

	let cumulative = 0;
	for (const rarity of RARITIES) {
		cumulative += RARITY_WEIGHTS[rarity];
		if (roll <= cumulative) {
			return rarity;
		}
	}

	return "common"; // Fallback
};

/**
 * Pick a random config from a specific rarity pool.
 */
const pickRandomFromRarity = (
	rarity: ConfigRarity,
	eligibleConfigs: Config[],
	excludeIds: Set<string>
): Config | null => {
	const pool = eligibleConfigs.filter(
		(c) => c.rarity === rarity && !excludeIds.has(c.id)
	);

	if (pool.length === 0) {
		return null;
	}

	const randomIndex = Math.floor(Math.random() * pool.length);
	return pool[randomIndex];
};

/**
 * Select random configs using two-step weighted random selection:
 * 1. Roll rarity tier based on weights
 * 2. Pick random config from that rarity pool
 *
 * Excludes configs the user already owns.
 */
export const selectRandomConfigs = (
	availableConfigs: Config[],
	ownedConfigIds: string[],
	count: number
): Config[] => {
	// Variants are only reachable through their shell — never offer them directly.
	// A shell is considered owned if any of its variants is already in activeConfigIds.
	const ownedShellIds = new Set(
		availableConfigs
			.filter((c) => c.variantOf && ownedConfigIds.includes(c.id))
			.map((c) => c.variantOf as string)
	);

	const eligibleConfigs = availableConfigs.filter(
		(config) =>
			!config.variantOf &&
			!ownedConfigIds.includes(config.id) &&
			!ownedShellIds.has(config.id)
	);

	if (eligibleConfigs.length === 0) {
		return [];
	}

	const selected: Config[] = [];
	const selectedIds = new Set<string>();
	const maxAttempts = count * 10; // Prevent infinite loops
	let attempts = 0;

	while (selected.length < count && attempts < maxAttempts) {
		attempts++;

		// Step 1: Roll rarity tier
		const rarity = rollRarity();

		// Step 2: Pick random config from that rarity
		const pick = pickRandomFromRarity(rarity, eligibleConfigs, selectedIds);

		if (pick) {
			selected.push(pick);
			selectedIds.add(pick.id);
			continue;
		}

		// If rolled rarity pool is empty, try other rarities (fallback)
		for (const fallbackRarity of RARITIES) {
			if (fallbackRarity === rarity) continue;

			const fallbackPick = pickRandomFromRarity(
				fallbackRarity,
				eligibleConfigs,
				selectedIds
			);

			if (fallbackPick) {
				selected.push(fallbackPick);
				selectedIds.add(fallbackPick.id);
				break;
			}
		}
	}

	return selected;
};

/**
 * Preview the next reroll's offerings without persisting.
 * Used to show what configs will be available after reroll.
 * This is pure in-memory - no database access.
 */
export const previewNextShopOfferings = (
	ownedConfigIds: string[],
	effects: ShopEffects,
	availableConfigs: Config[] = configs
): (Config & { originalCost?: number })[] => {
	const count = effects.extraSlot
		? DEFAULT_OFFERED_CONFIGS_COUNT + 1
		: DEFAULT_OFFERED_CONFIGS_COUNT;

	const selectedConfigs = selectRandomConfigs(
		availableConfigs,
		ownedConfigIds,
		count
	);

	return selectedConfigs.map((config) =>
		withDiscount(config, effects.reductionCost ?? 0)
	);
};

/**
 * Helper to convert stored config IDs back to configs with discounts.
 */
export const applyDiscountsToConfigIds = (
	configIds: string[],
	reductionCost: number,
	availableConfigs: Config[] = configs
): (Config & { originalCost?: number })[] => {
	return configIds
		.map((id) => availableConfigs.find((c) => c.id === id))
		.filter((config): config is Config => config !== undefined)
		.map((config) => withDiscount(config, reductionCost));
};

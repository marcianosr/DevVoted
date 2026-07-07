/**
 * Shop offerings service - DB-backed shop item management.
 * This file contains functions that interact with the database.
 * For pure selection logic (no DB), see configSelection.ts
 */
import { DEFAULT_OFFERED_CONFIGS_COUNT } from "~/config/economy";
import { configs } from "~/domains/economy/data/configs";
import { Config } from "~/domains/economy/models/config.model";

import {
	applyDiscountsToConfigIds,
	selectRandomConfigs,
	type ShopEffects,
} from "./configSelection";
import {
	type ExposedDeckWithDetails,
	getActiveRunsExcludingUser,
	getDailyExposedDeckWithDetails,
	getLockedShopOffering,
	getShopOfferings,
	storeDailyExposedDeck,
	storeNextShopOfferings,
	storeShopOfferings,
} from "../api/shopOfferings.queries";

/**
 * Helper to generate and store both current and next offerings.
 * This ensures the "next offerings" preview always matches what reroll will produce.
 */
const generateAndStoreOfferings = async (
	runId: number,
	date: string,
	rerollNumber: number,
	ownedConfigIds: string[],
	count: number,
	isLocked: boolean,
	availableConfigs: Config[]
): Promise<string[]> => {
	// Generate current offerings
	const currentConfigs = selectRandomConfigs(
		availableConfigs,
		ownedConfigIds,
		count
	);
	const currentConfigIds = currentConfigs.map((c) => c.id);

	// Store current offerings
	await storeShopOfferings(
		runId,
		date,
		rerollNumber,
		currentConfigIds,
		isLocked
	);

	// Pre-generate and store next offerings (for preview)
	const nextConfigs = selectRandomConfigs(
		availableConfigs,
		ownedConfigIds,
		count
	);
	const nextConfigIds = nextConfigs.map((c) => c.id);

	// Pre-generate next offerings — skip if already exists (unique constraint)
	await storeNextShopOfferings(
		runId,
		date,
		rerollNumber + 1,
		nextConfigIds,
		isLocked
	);

	return currentConfigIds;
};

/**
 * Get or create shop offerings for a run on a specific date.
 * Uses DB-stored offerings instead of seed-based generation.
 * Also pre-generates next offerings for accurate preview.
 */
export const getOrCreateShopOfferings = async (
	runId: number,
	date: string,
	rerollNumber: number,
	ownedConfigIds: string[],
	effects: ShopEffects,
	availableConfigs: Config[] = configs
): Promise<(Config & { originalCost?: number })[]> => {
	const count = effects.extraSlot
		? DEFAULT_OFFERED_CONFIGS_COUNT + 1
		: DEFAULT_OFFERED_CONFIGS_COUNT;

	// Check for locked offering first (yarn.lock config)
	if (effects.lockShop) {
		const lockedOffering = await getLockedShopOffering(runId);
		if (lockedOffering) {
			return applyDiscountsToConfigIds(
				lockedOffering.config_ids,
				effects.reductionCost ?? 0,
				availableConfigs
			);
		}
	}

	// Check for the exact current reroll slot — never the latest/max,
	// because the pre-generated "next" slot is always stored at rerollNumber+1.
	const existingOffering = await getShopOfferings(runId, date, rerollNumber);
	if (existingOffering) {
		return applyDiscountsToConfigIds(
			existingOffering.config_ids,
			effects.reductionCost ?? 0,
			availableConfigs
		);
	}

	// First visit for this date: generate current (rerollNumber) and pre-generate next (rerollNumber+1).
	const configIds = await generateAndStoreOfferings(
		runId,
		date,
		rerollNumber,
		ownedConfigIds,
		count,
		effects.lockShop ?? false,
		availableConfigs
	);

	return applyDiscountsToConfigIds(
		configIds,
		effects.reductionCost ?? 0,
		availableConfigs
	);
};

/**
 * Create new shop offerings after a reroll.
 * The pre-generated "next" offerings become current, and new "next" offerings are generated.
 */
export const createRerolledShopOfferings = async (
	runId: number,
	date: string,
	newRerollNumber: number,
	ownedConfigIds: string[],
	effects: ShopEffects,
	availableConfigs: Config[] = configs
): Promise<(Config & { originalCost?: number })[]> => {
	const count = effects.extraSlot
		? DEFAULT_OFFERED_CONFIGS_COUNT + 1
		: DEFAULT_OFFERED_CONFIGS_COUNT;

	// Check if we already have pre-generated offerings for this reroll number
	const preGeneratedOffering = await getShopOfferings(
		runId,
		date,
		newRerollNumber
	);

	if (preGeneratedOffering) {
		// Use the pre-generated offerings and generate new "next" offerings
		const nextConfigs = selectRandomConfigs(
			availableConfigs,
			ownedConfigIds,
			count
		);
		const nextConfigIds = nextConfigs.map((c) => c.id);

		// Pre-generate next offerings — skip if already exists (unique constraint)
		await storeNextShopOfferings(
			runId,
			date,
			newRerollNumber + 1,
			nextConfigIds,
			effects.lockShop ?? false
		);

		return applyDiscountsToConfigIds(
			preGeneratedOffering.config_ids,
			effects.reductionCost ?? 0,
			availableConfigs
		);
	}

	// Fallback: Generate and store new offerings (shouldn't normally happen)
	const configIds = await generateAndStoreOfferings(
		runId,
		date,
		newRerollNumber,
		ownedConfigIds,
		count,
		effects.lockShop ?? false,
		availableConfigs
	);

	return applyDiscountsToConfigIds(
		configIds,
		effects.reductionCost ?? 0,
		availableConfigs
	);
};

/**
 * Get the pre-generated next shop offerings for preview.
 * Returns null if no next offerings exist (shouldn't happen in normal flow).
 */
export const getNextShopOfferings = async (
	runId: number,
	date: string,
	nextRerollNumber: number,
	effects: ShopEffects,
	availableConfigs: Config[] = configs
): Promise<(Config & { originalCost?: number })[] | null> => {
	// Fetch pre-generated next offerings
	const nextOffering = await getShopOfferings(runId, date, nextRerollNumber);

	if (!nextOffering) {
		return null;
	}

	return applyDiscountsToConfigIds(
		nextOffering.config_ids,
		effects.reductionCost ?? 0,
		availableConfigs
	);
};

/**
 * Get or create the daily exposed deck for public-config holders.
 * All users with public-config see the same randomly selected player's deck.
 */
export const getOrCreateExposedDeck = async (
	date: string,
	excludeUserId: string
): Promise<ExposedDeckWithDetails | null> => {
	// Check for existing selection for today
	const existingDeck = await getDailyExposedDeckWithDetails(date);
	if (existingDeck) {
		return existingDeck;
	}

	// Get all eligible active runs
	const activeRuns = await getActiveRunsExcludingUser(excludeUserId);
	if (activeRuns.length === 0) {
		return null;
	}

	// Randomly select one
	const randomIndex = Math.floor(Math.random() * activeRuns.length);
	const selected = activeRuns[randomIndex];

	// Store in database
	await storeDailyExposedDeck(date, selected.runId, selected.userId);

	return {
		userId: selected.userId,
		displayName: selected.displayName,
		photoUrl: selected.photoUrl,
		configIds: selected.configIds,
		runId: selected.runId,
	};
};

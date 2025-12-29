import { aggregateRunCategoryCoverage } from "~/domains/runs/utils/coverageCalculations";
import type { CategoryCode } from "~/domains/shared/categories";
import { handleApiOperation } from "~/utils/errorHandling";

import {
	getActiveRunByUserId,
	createRunForUser,
	getLastRunFromUser,
	getLiveRunRankings,
	skipShop,
} from "./queries";
import { endRunManually } from "../services/runCompletion.service";

export const getOrCreateActiveRun = async (
	userId: string,
	challengeModeId: string
) => {
	return handleApiOperation(async () => {
		// Check if user has an active run
		const activeRun = await getActiveRunByUserId(userId);

		if (activeRun) {
			return activeRun;
		}

		// Create a new run
		const newRunData = await createRunForUser(userId, challengeModeId);
		return newRunData;
	}, "Failed to get or create run");
};

export const getUserActiveRun = async (userId: string) => {
	return handleApiOperation(async () => {
		const activeRun = await getActiveRunByUserId(userId);

		if (!activeRun) {
			throw new Error("No active run found");
		}

		return activeRun;
	}, "Failed to get active run");
};

export const getLastRunForUser = async (userId: string) => {
	return handleApiOperation(async () => {
		const lastRun = await getLastRunFromUser(userId);
		return lastRun;
	}, "Failed to get last run");
};

export const getActiveRunCategoryCoverageHandler = async (userId: string) => {
	return handleApiOperation(async () => {
		const activeRun = await getActiveRunByUserId(userId);

		if (!activeRun) {
			throw new Error("No active run found");
		}

		const { totalCoverage } = aggregateRunCategoryCoverage(
			activeRun.categoryCoverage
		);

		return {
			categoryCoverage: activeRun.categoryCoverage,
			runId: activeRun.id,
			totalCoverage,
		};
	}, "Failed to get active run category coverage");
};

export const getLiveRunRankingsHandler = async (
	categoryCode?: CategoryCode
) => {
	return handleApiOperation(async () => {
		const rankings = await getLiveRunRankings(categoryCode);
		return rankings;
	}, "Failed to get live run rankings");
};

/**
 * Finishes user's active run with stats processing
 *
 * Used when manually breaking off runs (e.g., "Start New Run" button).
 * Saves stats and creates leaderboard entries like threshold failure.
 *
 * Uses endRunManually() which:
 * - Saves final stats (coverage, polls answered, streaks)
 * - Creates leaderboard entries
 * - Marks run as finished
 */
export const finishRunHandler = async (userId: string) => {
	return handleApiOperation(async () => {
		const activeRun = await getActiveRunByUserId(userId);

		if (!activeRun) {
			throw new Error("No active run found");
		}

		await endRunManually(activeRun.id);
		return { success: true };
	}, "Failed to finish run");
};

/**
 * Skips the shop for the current date and grants storage bonus
 * Base reward: 64KB + any storageBonus from active configs
 */
export const skipShopHandler = async (
	userId: string,
	runId: number,
	date: string,
	storageBonus: number = 0
) => {
	return handleApiOperation(async () => {
		const activeRun = await getActiveRunByUserId(userId);

		if (!activeRun) {
			throw new Error("No active run found");
		}

		if (activeRun.id !== runId) {
			throw new Error("Run does not belong to user");
		}

		if (activeRun.shopSkippedDate === date) {
			throw new Error("Shop already skipped for today");
		}

		return await skipShop(runId, date, storageBonus);
	}, "Failed to skip shop");
};

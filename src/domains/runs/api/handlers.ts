import { aggregateRunCategoryCoverage } from "~/domains/runs/utils/coverageCalculations";
import type { CategoryCode } from "~/shared/lib/categories";
import { handleApiOperation } from "~/shared/utils/errorHandling";

import {
	getActiveRunByUserId,
	createRunForUser,
	getLastRunFromUser,
	getAllRuns,
	getRunStats,
} from "./run.queries";
import type { StaticGateTypeId } from "~/domains/runs/data/pipelineSlots";
import { getLiveRunRankings } from "./ranking.queries";
import { skipShop } from "./shop.queries";
import { endRunManually } from "../services/runCompletion.service";
import {
	MIN_GATE_FOR_MANUAL_END,
	getActiveGate,
} from "../services/pipelineEvaluator.service";

export const getOrCreateActiveRun = async (
	userId: string,
	injectFromArchive: number = 0,
	extraPreRunSlotIds: StaticGateTypeId[] = []
) => {
	return handleApiOperation(async () => {
		// Returning the existing active run silently ignores injectFromArchive.
		// That's intentional: a player can only spend archive at run-start.
		// Once a run exists, the loadout step is no-op.
		const activeRun = await getActiveRunByUserId(userId);
		if (activeRun) return activeRun;

		return await createRunForUser(
			userId,
			injectFromArchive,
			extraPreRunSlotIds
		);
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

		// Anti-farm: manual quit is only allowed once the player has reached
		// gate 5. Early-quit harvesting of the 1MB starting capacity is impossible.
		// Death (involuntary) keeps the tiered conversion (20/25/50/100 at gates
		// 2/3/4/5+) — see archive.service.ts.
		const { totalPollsAnswered } = await getRunStats(activeRun.id);
		const gate = getActiveGate(totalPollsAnswered, activeRun.pipelineSlots);
		if (gate < MIN_GATE_FOR_MANUAL_END) {
			throw new Error(
				`You need to reach gate ${MIN_GATE_FOR_MANUAL_END} before ending a run. Keep playing!`
			);
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

export const getAllRunsHandler = async () => {
	return handleApiOperation(async () => {
		return await getAllRuns();
	}, "Failed to get all runs");
};

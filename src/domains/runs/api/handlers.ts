import {
	getActiveRunByUserId,
	createRunForUser,
	getLastRunFromUser,
	getLiveRunRankings,
} from "./queries";
import { handleApiOperation } from "~/utils/errorHandling";
import type { CategoryCode } from "~/domains/shared/categories";
import { aggregateRunCategoryXp } from "~/domains/runs/utils/xpCalculations";

export const getOrCreateActiveRun = async (userId: string) => {
	return handleApiOperation(async () => {
		// Check if user has an active run
		const activeRun = await getActiveRunByUserId(userId);

		if (activeRun) {
			return activeRun;
		}

		// Create a new run
		const newRunData = await createRunForUser(userId);
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

export const getActiveRunCategoryXpHandler = async (userId: string) => {
	return handleApiOperation(async () => {
		const activeRun = await getActiveRunByUserId(userId);

		if (!activeRun) {
			throw new Error("No active run found");
		}

		const { totalXp } = aggregateRunCategoryXp(activeRun.categoryXp);

		return {
			categoryXp: activeRun.categoryXp,
			runId: activeRun.id,
			totalXp,
		};
	}, "Failed to get active run category XP");
};

export const getLiveRunRankingsHandler = async (
	categoryCode?: CategoryCode
) => {
	return handleApiOperation(async () => {
		const rankings = await getLiveRunRankings(categoryCode);
		return rankings;
	}, "Failed to get live run rankings");
};

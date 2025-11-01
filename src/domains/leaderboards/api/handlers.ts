import { getGlobalLeaderboard } from "../services/leaderboardService";
import { getCategoryLeaderboard } from "./queries";
import type { CategoryCode } from "~/domains/shared/categories";
import { handleApiOperation } from "~/utils/errorHandling";

export const getGlobalLeaderboardHandler = async () => {
	return handleApiOperation(async () => {
		const entries = await getGlobalLeaderboard(10);
		return entries;
	}, "Failed to fetch global leaderboard");
};

export const getCategoryLeaderboardHandler = async ({ categoryCode }: { categoryCode?: CategoryCode }) => {
	return handleApiOperation(async () => {
		if (!categoryCode) {
			// Return global leaderboard if no category specified
			return await getGlobalLeaderboard(10);
		}

		const entries = await getCategoryLeaderboard(categoryCode, { limit: 10 });
		return entries;
	}, "Failed to fetch category leaderboard");
};
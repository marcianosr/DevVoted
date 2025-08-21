import { getGlobalLeaderboard } from "../services/leaderboardService";
import { getCategoryLeaderboard } from "./queries";
import type { CategoryCode } from "~/domains/shared/categories";

export const getGlobalLeaderboardHandler = async () => {
	try {
		const entries = await getGlobalLeaderboard(10);
		return entries;
	} catch (error) {
		console.error("Error fetching leaderboard:", error);
		return [];
	}
};

export const getCategoryLeaderboardHandler = async ({ categoryCode }: { categoryCode?: CategoryCode }) => {
	try {
		if (!categoryCode) {
			// Return global leaderboard if no category specified
			return await getGlobalLeaderboard(10);
		}
		
		const entries = await getCategoryLeaderboard(categoryCode, { limit: 10 });
		return entries;
	} catch (error) {
		console.error("Error fetching category leaderboard:", error);
		return [];
	}
};
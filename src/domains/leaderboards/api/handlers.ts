import { getGlobalLeaderboard } from "../services/leaderboardService";

export const getSimpleLeaderboardHandler = async () => {
	try {
		const entries = await getGlobalLeaderboard(10);
		return { success: true, entries };
	} catch (error) {
		console.error("Error fetching leaderboard:", error);
		return { success: false, entries: [], error: "Failed to load leaderboard" };
	}
};
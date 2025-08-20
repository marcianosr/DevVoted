import {
	getRunForCompletion,
	completeRunWithThresholdFailure,
	getTotalXpForRun,
	getTotalPollsAnsweredForRun,
	getBestStreakForRun,
	createLeaderboardEntry,
	getLastRunFromUser,
} from "../api/queries";
import {
	calculateThresholdInfo,
	type ThresholdInfo,
} from "~/domains/runs/services/thresholdCalculator.service";

// End run mid-game when XP threshold is not met (preserves progress in final_* columns)
export const endRunForThresholdFailure = async (runId: number) => {
	// Get the run to find the user ID
	const run = await getRunForCompletion(runId);

	if (!run) {
		throw new Error(`Run with ID ${runId} not found`);
	}

	// Get final stats before completing
	const totalXp = await getTotalXpForRun(runId);
	const totalPollsAnswered = await getTotalPollsAnsweredForRun(runId);
	const bestStreak = await getBestStreakForRun(runId);

	// Complete the run and reset categories
	await completeRunWithThresholdFailure(runId);

	// Create leaderboard entry to track this run's performance
	await createLeaderboardEntry(
		run.user_id,
		runId,
		run.season_id,
		totalXp,
		bestStreak,
		totalPollsAnswered
	);

	return { runEnded: true, reason: "threshold_not_met" };
};

// Helper function to check if run meets XP threshold to continue
export const checkXpThreshold = async (
	runId: number
): Promise<ThresholdInfo> => {
	const totalXp = await getTotalXpForRun(runId);
	const totalPollsAnswered = await getTotalPollsAnsweredForRun(runId);

	return calculateThresholdInfo(totalXp, totalPollsAnswered);
};


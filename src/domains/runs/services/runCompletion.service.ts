import {
	getRunForCompletion,
	completeRunWithThresholdFailure,
	getTotalXpForRun,
	getTotalPollsAnsweredForRun,
	getLastRunFromUser,
} from "../api/queries";
import {
	calculateThresholdInfo,
	type ThresholdInfo,
} from "~/domains/runs/services/thresholdCalculator.service";

// End run when XP threshold is not met
export const endRunForThresholdFailure = async (runId: number) => {
	// Get the run to find the user ID
	const run = await getRunForCompletion(runId);

	if (!run) {
		throw new Error(`Run with ID ${runId} not found`);
	}

	// Complete the run and reset categories
	await completeRunWithThresholdFailure(runId);

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

export const getLastRunForGameOver = async (userId: string) => {
	return getLastRunFromUser(userId);
};

// Track seasonal records when a run completes successfully
export const completeRunWithSeasonalTracking = async (runId: number) => {
	const run = await getRunForCompletion(runId);
	
	if (!run) {
		throw new Error(`Run with ID ${runId} not found`);
	}

	// Get final stats for this run
	const totalXp = await getTotalXpForRun(runId);
	const totalPollsAnswered = await getTotalPollsAnsweredForRun(runId);

	// Complete the run (finish it)
	const { finishRun } = await import("../api/queries");
	await finishRun(runId);

	// Update seasonal performance tracking
	// Note: This could be extended to update user performance records
	// or trigger seasonal achievements in the future
	return {
		runId,
		userId: run.user_id,
		seasonId: run.season_id,
		finalStats: {
			totalXp,
			totalPollsAnswered,
		},
		completed: true,
	};
};

// Check if this run sets any seasonal records for the user
export const checkForSeasonalRecords = async (runId: number) => {
	const run = await getRunForCompletion(runId);
	
	if (!run) {
		return { hasRecords: false, records: [] };
	}

	const totalXp = await getTotalXpForRun(runId);
	const records: string[] = [];

	// Get user's previous best runs in this season
	// This is a placeholder for future implementation when we have 
	// user performance tracking tables or more complex record comparison
	const seasonRecords = {
		previousBestXp: 0, // Could query from completed runs
		previousBestStreak: 0,
	};

	// Check if this run beats previous records
	if (totalXp > seasonRecords.previousBestXp) {
		records.push(`New seasonal XP record: ${totalXp}`);
	}

	return {
		hasRecords: records.length > 0,
		records,
		runId,
		seasonId: run.season_id,
	};
};

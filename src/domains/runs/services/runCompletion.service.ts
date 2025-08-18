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

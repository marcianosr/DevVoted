import { updateUserPerformanceFromRun } from "~/domains/userPerformance/services/userPerformance.service";
import {
	getRunForCompletion,
	completeRunWithThresholdFailure,
	getTotalXpForRun,
	getTotalPollsAnsweredForRun,
} from "../api/queries";
import {
	calculateThresholdInfo,
	calculateNextPollThresholdFromCategoryData,
	type ThresholdInfo,
} from "~/domains/userPerformance/services/thresholdCalculator.service";

export type RunCompletionResult = {
	readonly runEnded: boolean;
	readonly reason: string;
};

// End run when XP threshold is not met
export const endRunForThresholdFailure = async (runId: number) => {
	// Get the run to find the user ID
	const run = await getRunForCompletion(runId);

	if (!run) {
		throw new Error(`Run with ID ${runId} not found`);
	}

	// Update user performance records before resetting
	await updateUserPerformanceFromRun(runId, run.user_id);

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

// Helper function to get current threshold info for display (sync version using run data)
export const getCurrentThresholdInfo = (
	categoryXp: { currentXp: number; pollsAnswered: number }[]
): ThresholdInfo => {
	const categoryData = categoryXp.map((xp) => ({
		currentXp: xp.currentXp,
		pollsAnswered: xp.pollsAnswered,
	}));

	return calculateNextPollThresholdFromCategoryData(categoryData);
};

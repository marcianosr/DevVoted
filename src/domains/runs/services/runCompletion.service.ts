import {
	getRunForCompletion,
	completeRunWithThresholdFailure,
	getTotalCoverageForRun,
	getTotalPollsAnsweredForRun,
	getBestStreakForRun,
	createCategoryLeaderboardEntries,
	getRunWithCategoryXp,
} from "../api/queries";
import {
	calculateThresholdInfo,
	type ThresholdInfo,
} from "~/domains/runs/services/thresholdCalculator.service";

// End run mid-game when coverage threshold is not met (preserves progress in final_* columns)
export const endRunForThresholdFailure = async (runId: number) => {
	// Get the run to find the user ID
	const run = await getRunForCompletion(runId);

	if (!run) {
		throw new Error(`Run with ID ${runId} not found`);
	}

	// Get final stats before completing
	const totalCoverage = await getTotalCoverageForRun(runId);
	const totalPollsAnswered = await getTotalPollsAnsweredForRun(runId);
	const bestStreak = await getBestStreakForRun(runId);

	// Complete the run and reset categories
	await completeRunWithThresholdFailure(runId, "threshold_not_met");

	// Create category-specific leaderboard entries to track this run's performance
	await createCategoryLeaderboardEntries(
		run.user_id,
		runId,
		run.season_id,
		totalCoverage,
		totalPollsAnswered,
		bestStreak
	);

	return { runEnded: true, reason: "threshold_not_met" };
};

// End run manually (user chose to break off via "Start New Run" button)
// Saves stats and creates leaderboard entries like threshold failure
export const endRunManually = async (runId: number) => {
	const run = await getRunForCompletion(runId);

	if (!run) {
		throw new Error(`Run with ID ${runId} not found`);
	}

	const totalCoverage = await getTotalCoverageForRun(runId);
	const totalPollsAnswered = await getTotalPollsAnsweredForRun(runId);
	const bestStreak = await getBestStreakForRun(runId);

	await completeRunWithThresholdFailure(runId, "manual_break_off");

	await createCategoryLeaderboardEntries(
		run.user_id,
		runId,
		run.season_id,
		totalCoverage,
		totalPollsAnswered,
		bestStreak
	);

	return { runEnded: true, reason: "manual_break_off" };
};

// Helper function to check if run meets coverage threshold to continue
export const checkCoverageThreshold = async (
	runId: number
): Promise<ThresholdInfo> => {
	const runWithCategoryData = await getRunWithCategoryXp(runId);

	if (!runWithCategoryData) {
		throw new Error(`Run with ID ${runId} not found`);
	}

	return calculateThresholdInfo(runWithCategoryData.categoryCoverage);
};

// Check if player has passed all defined CI gates (victory condition)
// Victory occurs when current round exceeds the number of defined gates
// Example: With 7 gates defined, round 8 means gate 7 was just passed
export const checkForVictory = (currentRound: number): boolean => {
	const { CI_GATES } = require("~/domains/runs/services/thresholdCalculator.service");
	return currentRound > CI_GATES.length;
};

// Complete run with victory (all defined CI gates passed)
// Saves stats and creates leaderboard entries like other completion methods
export const completeRunWithVictory = async (runId: number) => {
	const run = await getRunForCompletion(runId);

	if (!run) {
		throw new Error(`Run with ID ${runId} not found`);
	}

	const totalCoverage = await getTotalCoverageForRun(runId);
	const totalPollsAnswered = await getTotalPollsAnsweredForRun(runId);
	const bestStreak = await getBestStreakForRun(runId);

	await completeRunWithThresholdFailure(runId, "victory");

	await createCategoryLeaderboardEntries(
		run.user_id,
		runId,
		run.season_id,
		totalCoverage,
		totalPollsAnswered,
		bestStreak
	);

	return { runEnded: true, reason: "victory" };
};

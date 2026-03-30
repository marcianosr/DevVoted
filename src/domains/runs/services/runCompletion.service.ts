import { getPollsSeenInRun } from "~/domains/polls/api/queries";
import {
	calculateThresholdInfo,
	type ThresholdInfo,
	type GateDefinition,
} from "~/domains/runs/services/thresholdCalculator.service";

import {
	completeRunWithThresholdFailure,
	getRunStats,
	createCategoryLeaderboardEntries,
	getRunWithCategoryCoverage,
} from "../api/queries";

// End run mid-game when coverage threshold is not met (preserves progress in final_* columns)
export const endRunForThresholdFailure = async (runId: number) => {
	// Get the run with category coverage data
	const run = await getRunWithCategoryCoverage(runId);

	if (!run) {
		throw new Error(`Run with ID ${runId} not found`);
	}

	const { totalCoverage } = await getRunStats(runId);

	await completeRunWithThresholdFailure(runId, "threshold_not_met");

	// Create category-specific leaderboard entries to track this run's performance
	await createCategoryLeaderboardEntries(
		run.userId,
		runId,
		run.seasonId,
		totalCoverage
	);

	return { runEnded: true, reason: "threshold_not_met" };
};

// End run manually (user chose to break off via "Start New Run" button)
// Saves stats and creates leaderboard entries like threshold failure
export const endRunManually = async (runId: number) => {
	const run = await getRunWithCategoryCoverage(runId);

	if (!run) {
		throw new Error(`Run with ID ${runId} not found`);
	}

	const { totalCoverage } = await getRunStats(runId);

	await completeRunWithThresholdFailure(runId, "manual_break_off");

	await createCategoryLeaderboardEntries(
		run.userId,
		runId,
		run.seasonId,
		totalCoverage
	);

	return { runEnded: true, reason: "manual_break_off" };
};

// Helper function to check if run meets coverage threshold to continue
export const checkCoverageThreshold = async (
	runId: number,
	gates: GateDefinition[]
): Promise<ThresholdInfo> => {
	const runWithCategoryData = await getRunWithCategoryCoverage(runId);

	if (!runWithCategoryData) {
		throw new Error(`Run with ID ${runId} not found`);
	}

	// Fetch polls seen in current run for threshold calculation
	const pollsSeenInRun = await getPollsSeenInRun(runId);

	return calculateThresholdInfo(
		runWithCategoryData.categoryCoverage,
		pollsSeenInRun,
		gates
	);
};

// Check if player has passed all defined CI gates (victory condition)
// Victory occurs when player passes the threshold check of the last gate
// Example: With 7 gates defined, victory triggers when gate 7's threshold is met
export const checkForVictory = (
	currentGate: number,
	gates: GateDefinition[]
): boolean => {
	return currentGate >= gates.length;
};

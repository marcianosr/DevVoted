import { archiveLeftoverStorage } from "~/domains/economy/services/archive.service";
import type {
	GateDifficulty,
	GateTypeId,
	PipelineSlotRequirement,
} from "~/domains/runs/models/pipeline.model";

import {
	completeRunWithThresholdFailure,
	getRunStats,
	getRunWithCategoryCoverage,
} from "../api/run.queries";
import { createCategoryLeaderboardEntries } from "../api/ranking.queries";

export type PipelineFailureSlot = {
	gateTypeId: GateTypeId;
	difficulty: GateDifficulty;
	requirement: PipelineSlotRequirement;
};

const encodePipelineFailure = (failedSlots: PipelineFailureSlot[]): string =>
	JSON.stringify({ type: "pipeline_failure", failedSlots });

// End run mid-game when a pipeline slot fails (preserves progress in final_* columns)
export const endRunForThresholdFailure = async (
	runId: number,
	failedSlots: PipelineFailureSlot[]
) => {
	const run = await getRunWithCategoryCoverage(runId);

	if (!run) {
		throw new Error(`Run with ID ${runId} not found`);
	}

	const { totalCoverage } = await getRunStats(runId);

	await completeRunWithThresholdFailure(
		runId,
		encodePipelineFailure(failedSlots)
	);

	// Non-critical writes — same swallow-and-log pattern as the leaderboard
	// call so a failure here can't block the client's game-over signal.
	await archiveLeftoverStorage(run);

	try {
		await createCategoryLeaderboardEntries(
			run.userId,
			runId,
			run.seasonId,
			totalCoverage
		);
	} catch (err) {
		// Non-critical — run is already marked finished. Don't let leaderboard
		// failures propagate and cause handleApiOperation to return { success: false },
		// which would prevent the game-over signal from reaching the client.
		console.error(
			"[endRunForThresholdFailure] Leaderboard creation failed:",
			err
		);
	}

	return { runEnded: true, reason: "pipeline_failure" };
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

	await archiveLeftoverStorage(run);

	await createCategoryLeaderboardEntries(
		run.userId,
		runId,
		run.seasonId,
		totalCoverage
	);

	return { runEnded: true, reason: "manual_break_off" };
};

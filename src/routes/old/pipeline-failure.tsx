// @ts-nocheck — legacy game routes parked under /old (DVTD-7tof cleanup).
// Internal links still use pre-move paths; unmaintained, delete-on-cleanup.
import { useState } from "react";

import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";
import { getCommunityStats } from "~/domains/polls/api/communityStats";
import { getDailyPoll } from "~/domains/polls/api/polls";
import { PollResultsSection } from "~/domains/polls/components/PollResultsSection.component";
import { getActiveConfigs } from "~/domains/economy/services/configManager.service";
import { getLastRunForGameOver } from "~/domains/runs/api/runs";
import { CurrentPipeline } from "~/domains/runs/components/CurrentPipeline.component";
import { getCategoryMetadata } from "~/domains/shared/categories";
import { runFactory } from "~/domains/runs/models/run.model";
import type { PipelineSlot } from "~/domains/runs/models/pipeline.model";
import {
	getCurrentGate,
	type PipelineEvaluation,
	type SlotEvaluation,
} from "~/domains/runs/services/pipelineEvaluator.service";
import type { PipelineFailureSlot } from "~/domains/runs/services/runCompletion.service";
import { deriveNavRunState } from "~/domains/runs/utils/deriveNavRunState";
import { parseCompletionReason } from "~/domains/runs/utils/parseCompletionReason";
import { PipelineFailureScreen } from "~/ui/runs/PipelineFailureScreen.ui";
import type { RunSummaryData } from "~/ui/runs/PipelineFailureScreen.ui";

export const Route = createFileRoute("/old/pipeline-failure")({
	component: PipelineFailureRoute,
	loader: async ({ context: { activeRun } }) => {
		// The failure screen renders the last finished run. A run still in
		// progress must not land here — send the player back to their run.
		if (deriveNavRunState(activeRun).hasActiveRun) {
			throw redirect({ to: "/daily-poll" });
		}

		const lastRunResult = await getLastRunForGameOver();
		const lastRun = lastRunResult.success ? lastRunResult.data : null;
		if (!lastRun) return { lastRun: null, review: null };

		// The failing poll is the run's most recent (today's) daily poll.
		const pollResult = await getDailyPoll({ data: { runId: lastRun.run.id } });
		if (!pollResult.success || !pollResult.data.hasAnswered) {
			return { lastRun, review: null };
		}

		const { poll, selectedOptions } = pollResult.data;
		const communityStats = await getCommunityStats({
			data: { pollId: poll.id },
		});

		return { lastRun, review: { poll, selectedOptions, communityStats } };
	},
});

const sameSlot = (slot: PipelineSlot, failed: PipelineFailureSlot) =>
	failed.gateTypeId === slot.gateTypeId &&
	failed.difficulty === slot.difficulty &&
	JSON.stringify(failed.requirement) === JSON.stringify(slot.requirement);

// Reconstruct a per-slot evaluation from the persisted failed slots so the
// pipeline layout can render every check's pass/fail outcome.
const buildEvaluation = (
	slots: PipelineSlot[],
	failedSlots: PipelineFailureSlot[]
): PipelineEvaluation => {
	const slotEvaluations: SlotEvaluation[] = slots.map((slot) => {
		const failed = failedSlots.some((f) => sameSlot(slot, f));
		return { slot, passed: !failed, status: failed ? "failed" : "passed" };
	});
	return { passed: false, slotEvaluations, totalReward: 0 };
};

function PipelineFailureRoute() {
	const { lastRun, review } = Route.useLoaderData();
	const navigate = useNavigate();
	const [showReview, setShowReview] = useState(false);

	if (showReview && review) {
		return (
			<Screen
				key="review"
				categoryCode={review.poll.categoryCode}
				transition="fade"
				rightAction={{
					label: "Back to summary →",
					onClick: () => setShowReview(false),
				}}
			>
				<PollResultsSection
					poll={review.poll}
					selectedOptions={review.selectedOptions}
					communityStats={review.communityStats}
					explanation={review.poll.explanation}
				/>
			</Screen>
		);
	}

	const completion = parseCompletionReason(
		lastRun?.run.completion_reason ?? null
	);
	const failedSlots =
		completion.type === "pipeline_failure" ? completion.failedSlots : [];
	const runDTO = lastRun ? runFactory.toDTO(lastRun.run) : null;
	const allSlots = runDTO?.pipelineSlots ?? [];
	const installedConfigs = runDTO
		? getActiveConfigs(runDTO).map((config) => ({
				id: config.id,
				name: config.name,
				rarity: config.rarity,
			}))
		: [];

	const coverage = lastRun?.categoryCoverage ?? [];
	const pollsAnswered = lastRun?.totalPollsAnswered ?? 0;
	// The run ended on the gate it reached, so every gate below it was cleared.
	const gatesCleared = Math.max(0, getCurrentGate(pollsAnswered, allSlots) - 1);
	const runSummary: RunSummaryData = {
		pollsAnswered,
		pollsCorrect: coverage.reduce((sum, c) => sum + c.correctPollsAnswered, 0),
		totalCoverage: lastRun?.totalCoverage ?? 0,
		bestStreak: Math.max(0, ...coverage.map((c) => c.bestStreak)),
		gatesCleared,
		pipelinesFought: allSlots.length,
		shopRebuilds: lastRun?.run.total_rerolls ?? 0,
		archivedCredit: lastRun?.archivedCredit ?? 0,
	};

	const categoryCoverage = coverage.map((c) => ({
		categoryCode: c.categoryCode,
		categoryName: getCategoryMetadata(c.categoryCode).name,
		coverage: c.currentCoverage,
		bestStreak: c.bestStreak,
		pollsCorrect: c.correctPollsAnswered,
		pollsAnswered: c.pollsAnswered,
	}));

	return (
		<Screen
			key="summary"
			transition="fade"
			leftAction={
				review
					? { label: "Review answer", onClick: () => setShowReview(true) }
					: undefined
			}
			rightAction={{
				label: "Start new run →",
				onClick: () => navigate({ to: "/start" }),
			}}
		>
			<PipelineFailureScreen
				categoryCoverage={categoryCoverage}
				pipelineSlot={
					<CurrentPipeline
						slots={allSlots}
						evaluation={buildEvaluation(allSlots, failedSlots)}
					/>
				}
				runSummary={runSummary}
				installedConfigs={installedConfigs}
			/>
		</Screen>
	);
}

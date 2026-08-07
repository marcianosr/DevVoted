// @ts-nocheck — legacy game routes parked under /old (DVTD-7tof cleanup).
// Internal links still use pre-move paths; unmaintained, delete-on-cleanup.
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { applyEffects } from "~/domains/economy/data/configs";
import { getCommunityStats } from "~/domains/polls/api/communityStats";
import { getDailyPoll } from "~/domains/polls/api/polls";
import CategoryWeightsDisplay from "~/domains/polls/components/CategoryWeightsDisplay.component";
import { CommunitySection } from "~/domains/polls/components/CommunitySection.component";
import { useCountdownToNextPoll } from "~/domains/polls/hooks/useCountdownToNextPoll";
import {
	getExposedConfigDeck,
	getWindowContextFn,
} from "~/domains/runs/api/runs";
import { RunJeopardy } from "~/domains/runs/components/RunJeopardy.component";
import { getTodayDateString } from "~/lib/dateUtils";
import { Screen } from "~/ui/Screen.ui";

export const Route = createFileRoute("/old/community")({
	component: CommunityRoute,
	beforeLoad: ({ context }) => {
		if (!context.activeRun?.success || !context.activeRun.data?.id) {
			throw redirect({ to: "/start" });
		}
	},
	loader: async ({ context: { activeRun } }) => {
		if (!activeRun?.success) throw new Error("No active run");
		const run = activeRun.data;
		const today = getTodayDateString();

		const pollResult = await getDailyPoll({ data: { runId: run.id } });
		if (!pollResult.success) throw new Error("No daily poll");
		const { poll, options, hasAnswered } = pollResult.data;

		const { exposeConfigDeck } = applyEffects(
			{ poll, options, hasAnswered, run },
			run.activeConfigIds
		);

		const [communityStats, exposedDeckResult, windowContext] =
			await Promise.all([
				getCommunityStats({ data: { pollId: poll.id } }),
				exposeConfigDeck
					? getExposedConfigDeck({ data: { date: today } })
					: null,
				getWindowContextFn(),
			]);
		const exposedConfigDeck = exposedDeckResult?.success
			? exposedDeckResult.data
			: null;

		return {
			communityStats,
			exposedConfigDeck,
			viewerUserId: run.userId,
			windowContext,
			categoryCoverage: run.categoryCoverage,
			pipelineSlots: run.pipelineSlots,
		};
	},
});

function CommunityRoute() {
	const {
		communityStats,
		exposedConfigDeck,
		viewerUserId,
		windowContext,
		categoryCoverage,
		pipelineSlots,
	} = Route.useLoaderData();
	const navigate = useNavigate();
	const nextPoll = useCountdownToNextPoll();

	return (
		<Screen
			transition="slide-up"
			leftAction={{
				label: "← Back to shop",
				onClick: () => navigate({ to: "/shop" }),
			}}
			rightAction={{
				label: nextPoll.actionLabel,
				onClick: () => navigate({ to: "/daily-poll" }),
				disabled: !nextPoll.isOpen,
			}}
		>
			<CommunitySection
				communityStats={communityStats}
				exposedConfigDeck={exposedConfigDeck}
				viewerUserId={viewerUserId}
			/>
			<CategoryWeightsDisplay />
			<RunJeopardy
				windowContext={windowContext}
				categoryCoverage={categoryCoverage}
				pipelineSlots={pipelineSlots}
				countdownLabel={nextPoll.countdown}
			/>
		</Screen>
	);
}

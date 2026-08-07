// @ts-nocheck — legacy game routes parked under /old (DVTD-7tof cleanup).
// Internal links still use pre-move paths; unmaintained, delete-on-cleanup.
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import {
	getPipelineScoreHeaderFn,
	getWindowContextWithPreviousFn,
} from "~/domains/runs/api/runs";
import { CurrentPipeline } from "~/domains/runs/components/CurrentPipeline.component";
import { PipelineScoreSection } from "~/domains/runs/components/PipelineScoreSection.component";
import { PipelineStatusHeader } from "~/domains/runs/components/PipelineStatusHeader.component";
import { Columns } from "~/ui/Columns.ui";
import { Screen } from "~/ui/Screen.ui";
import { Stack } from "~/ui/Stack.ui";

export const Route = createFileRoute("/old/pipelines")({
	component: PipelinesRoute,
	beforeLoad: ({ context }) => {
		if (!context.activeRun?.success || !context.activeRun?.data?.id) {
			throw redirect({ to: "/start" });
		}
		// Passing a gate leaves cards to pick — that celebration + picking lives on
		// the success screen now, so this view stays purely "current pipeline".
		if (context.activeRun.data.pendingUpgradeCards.length > 0) {
			throw redirect({ to: "/pipeline-success" });
		}
	},
	loader: async ({ context: { activeRun } }) => {
		if (!activeRun?.success) {
			throw new Error("No active run");
		}

		const [windowContext, scoreHeader] = await Promise.all([
			getWindowContextWithPreviousFn(),
			getPipelineScoreHeaderFn(),
		]);

		return {
			activeRun: activeRun.data,
			windowContext,
			scoreHeader,
		};
	},
});

function PipelinesRoute() {
	const { activeRun, windowContext, scoreHeader } = Route.useLoaderData();
	const navigate = useNavigate();

	return (
		<Screen
			transition="fade"
			center
			leftAction={{
				label: "← Review answer",
				onClick: () => navigate({ to: "/daily-poll" }),
			}}
			rightAction={{
				label: "Go to shop →",
				onClick: () => navigate({ to: "/shop" }),
			}}
		>
			<Stack gap="8">
				<PipelineStatusHeader context={windowContext?.current} />
				<Columns
					aside={scoreHeader && <PipelineScoreSection equation={scoreHeader} />}
					main={
						<CurrentPipeline
							slots={activeRun.pipelineSlots}
							current={windowContext?.current}
							previous={windowContext?.previous}
							showWindowStatus={false}
						/>
					}
				/>
			</Stack>
		</Screen>
	);
}

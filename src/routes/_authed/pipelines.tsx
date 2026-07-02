import { createFileRoute, redirect } from "@tanstack/react-router";

import { getWindowContextFn } from "~/domains/runs/api/runs";
import { CurrentPipeline } from "~/domains/runs/components/UpgradePipelineSection.component";

export const Route = createFileRoute("/_authed/pipelines")({
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

		const windowContext = await getWindowContextFn();

		return {
			activeRun: activeRun.data,
			windowContext,
		};
	},
});

function PipelinesRoute() {
	const { activeRun, windowContext } = Route.useLoaderData();

	return (
		<section className="max-w-5xl mx-auto p-4">
			<CurrentPipeline
				slots={activeRun.pipelineSlots}
				evaluationContext={windowContext ?? undefined}
			/>
		</section>
	);
}

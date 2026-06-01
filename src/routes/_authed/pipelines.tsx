import { createFileRoute, redirect } from "@tanstack/react-router";

import { getWindowContextFn } from "~/domains/runs/api/runs";
import { CurrentPipeline } from "~/domains/runs/components/UpgradePipelineSection.component";
import { PipelineUpgradeContainer } from "~/domains/runs/components/PipelineUpgradeContainer.component";
import { useApplyPipelineUpgrade } from "~/domains/runs/hooks/useApplyPipelineUpgrade";

export const Route = createFileRoute("/_authed/pipelines")({
	component: PipelinesRoute,
	beforeLoad: ({ context }) => {
		if (!context.activeRun?.success || !context.activeRun?.data?.id) {
			throw redirect({ to: "/start" });
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
	const { apply, isPending } = useApplyPipelineUpgrade();

	const pendingUpgradeCards = activeRun.pendingUpgradeCards;

	if (pendingUpgradeCards.length > 0) {
		return (
			<section className="max-w-5xl mx-auto p-4">
				<PipelineUpgradeContainer
					cards={pendingUpgradeCards}
					currentSlots={activeRun.pipelineSlots}
					onAccept={apply}
					isPending={isPending}
					evaluationContext={windowContext ?? undefined}
				/>
			</section>
		);
	}

	return (
		<section className="max-w-5xl mx-auto p-4">
			<CurrentPipeline
				slots={activeRun.pipelineSlots}
				evaluationContext={windowContext ?? undefined}
			/>
		</section>
	);
}

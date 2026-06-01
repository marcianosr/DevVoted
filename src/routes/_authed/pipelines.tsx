import { Link, createFileRoute, redirect } from "@tanstack/react-router";

import { getWindowContextFn } from "~/domains/runs/api/runs";
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
		<section className="max-w-5xl mx-auto p-4 space-y-6">
			<header>
				<h1 className="text-3xl">Pipelines</h1>
				<p className="text-gray-400">
					No pipeline upgrades pending. Keep clearing gates to earn new cards.
				</p>
			</header>
			<div className="border border-theme p-4">
				<h2 className="text-xl mb-2">
					Active slots ({activeRun.pipelineSlots.length})
				</h2>
				{activeRun.pipelineSlots.length === 0 ? (
					<p className="text-gray-500">No pipeline slots yet.</p>
				) : (
					<ul className="space-y-2">
						{activeRun.pipelineSlots.map((slot, i) => (
							<li key={`${slot.gateTypeId}-${i}`} className="text-sm">
								<span className="text-theme">{slot.gateTypeId}</span>
								<span className="text-gray-500"> · {slot.difficulty}</span>
							</li>
						))}
					</ul>
				)}
			</div>
			<Link to="/daily-poll" className="inline-block underline">
				Back to today&apos;s poll
			</Link>
		</section>
	);
}

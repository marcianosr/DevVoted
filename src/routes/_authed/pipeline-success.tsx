import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import Content from "~/components/Content.component";
import { getStorageInfo } from "~/domains/economy/services/configManager.service";
import { getWindowContextFn } from "~/domains/runs/api/runs";
import { PipelineUpgradeContainer } from "~/domains/runs/components/PipelineUpgradeContainer.component";
import { useApplyPipelineUpgrade } from "~/domains/runs/hooks/useApplyPipelineUpgrade";
import { getSlotLabel } from "~/domains/runs/utils/formatPipelineRequirement";
import { PipelineSuccessScreen } from "~/ui/runs/PipelineSuccessScreen.ui";
import type { PipelineReward } from "~/ui/runs/PipelineSuccessScreen.ui";
import { PrimaryButton } from "~/ui/PrimaryButton.component";

export const Route = createFileRoute("/_authed/pipeline-success")({
	component: PipelineSuccessRoute,
	beforeLoad: ({ context }) => {
		if (!context.activeRun?.success || !context.activeRun.data?.id) {
			throw redirect({ to: "/start" });
		}
	},
	loader: async () => ({ windowContext: await getWindowContextFn() }),
});

function PipelineSuccessRoute() {
	const { activeRun } = Route.useRouteContext();
	const { windowContext } = Route.useLoaderData();
	const navigate = useNavigate();
	const { applyMany, isPending } = useApplyPipelineUpgrade({
		onApplied: () => navigate({ to: "/daily-poll" }),
	});

	// Guaranteed by beforeLoad; re-checked here to narrow the union without `!`.
	if (!activeRun?.success || !activeRun.data) return null;

	const run = activeRun.data;
	const storage = getStorageInfo(run);
	// The cleared gate is one below the currently active one. Derived from the
	// run — never trusted from the URL.
	const gateNumber = Math.max(1, (windowContext?.currentGate ?? 2) - 1);
	// Reward breakdown from the pipeline's own slots. The storage meter reflects
	// the actual awarded storage; this itemises the payout structure.
	const rewards: PipelineReward[] = run.pipelineSlots.map((slot) => ({
		label: `${getSlotLabel(slot.gateTypeId)} · ${slot.difficulty}`,
		bytes: slot.reward,
	}));
	const totalReward = rewards.reduce((sum, reward) => sum + reward.bytes, 0);
	const pendingCards = run.pendingUpgradeCards;

	return (
		<Content transition="fade">
			<PipelineSuccessScreen
				gateNumber={gateNumber}
				rewards={rewards}
				totalReward={totalReward}
				storageUsed={storage.storageUsed}
				storageLimit={storage.storageLimit}
			>
				{pendingCards.length > 0 ? (
					<PipelineUpgradeContainer
						cards={pendingCards}
						currentSlots={run.pipelineSlots}
						onConfirm={applyMany}
						isPending={isPending}
						evaluationContext={windowContext ?? undefined}
						showHeading={false}
					/>
				) : (
					<PrimaryButton
						onClick={() => navigate({ to: "/daily-poll" })}
						className="self-start px-6 py-3"
					>
						Continue →
					</PrimaryButton>
				)}
			</PipelineSuccessScreen>
		</Content>
	);
}

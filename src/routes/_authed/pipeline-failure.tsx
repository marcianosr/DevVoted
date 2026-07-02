import { createFileRoute, useNavigate } from "@tanstack/react-router";

import Content from "~/components/Content.component";
import { getLastRunForGameOver } from "~/domains/runs/api/runs";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";
import { parseCompletionReason } from "~/domains/runs/utils/parseCompletionReason";
import { PipelineFailureScreen } from "~/ui/runs/PipelineFailureScreen.ui";
import type { FailedSlotSummary } from "~/ui/runs/PipelineFailureScreen.ui";

export const Route = createFileRoute("/_authed/pipeline-failure")({
	component: PipelineFailureRoute,
	loader: async () => {
		const lastRun = await getLastRunForGameOver();
		return { lastRun: lastRun.success ? lastRun.data : null };
	},
});

function PipelineFailureRoute() {
	const { lastRun } = Route.useLoaderData();
	const navigate = useNavigate();

	const completion = parseCompletionReason(
		lastRun?.run.completion_reason ?? null
	);

	const failedSlots: FailedSlotSummary[] =
		completion.type === "pipeline_failure"
			? completion.failedSlots.map((slot) => ({
					label: `${getSlotLabel(slot.gateTypeId)} · ${slot.difficulty}`,
					requirement: formatRequirement(slot.requirement),
				}))
			: [];

	return (
		<Content transition="fade">
			<PipelineFailureScreen
				failedSlots={failedSlots}
				onStartNewRun={() => navigate({ to: "/start" })}
				onViewSummary={() => navigate({ to: "/game-over" })}
			/>
		</Content>
	);
}

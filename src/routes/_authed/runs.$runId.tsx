import { createFileRoute } from "@tanstack/react-router";

import { RunRecap } from "~/modules/run/run/presentation/RunRecap.component";

const RunRecapPage = () => {
	const { runId } = Route.useParams();

	return <RunRecap runId={Number(runId)} />;
};

export const Route = createFileRoute("/_authed/runs/$runId")({
	component: RunRecapPage,
});

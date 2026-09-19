import { createFileRoute } from "@tanstack/react-router";

import { RunRecap } from "~/modules/run/run/presentation/RunRecap.component";

const RunRecapPage = () => {
	const { runId } = Route.useParams();

	return <RunRecap runId={Number(runId)} />;
};

/**
 * Plural, and deliberately: `/runs/` is the archive, `/run/` is the climb you
 * are playing. Only the archive needs an id — the live run is resolved from
 * the session, so it never carries one.
 */
export const Route = createFileRoute("/_authed/runs/$runId")({
	component: RunRecapPage,
});

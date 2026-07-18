import { createFileRoute } from "@tanstack/react-router";

import { RunCommunity } from "~/modules/run/presentation/community/RunCommunity.component";

export const Route = createFileRoute("/_authed/run_/community")({
	component: RunCommunityRoute,
});

function RunCommunityRoute() {
	return <RunCommunity />;
}

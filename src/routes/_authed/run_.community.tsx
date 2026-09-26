import { createFileRoute } from "@tanstack/react-router";

import { RunCommunity } from "~/modules/run/community/presentation/RunCommunity.component";

export const Route = createFileRoute("/_authed/run_/community")({
	component: RunCommunity,
});

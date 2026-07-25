import { createFileRoute } from "@tanstack/react-router";

import { RunCommunity } from "~/modules/run/presentation/community/RunCommunity.component";

// The `run_` prefix escapes the /run layout on purpose: this page is a
// breather outside the climb (no HUD), and sitting outside the layout keeps
// the status→route sync from redirecting the detour away.
export const Route = createFileRoute("/_authed/run_/community")({
	component: RunCommunity,
});

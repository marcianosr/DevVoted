import { createFileRoute } from "@tanstack/react-router";

import { RunPoll } from "~/modules/run/run/presentation/RunPoll.component";

export const Route = createFileRoute("/_authed/run/poll")({
	component: RunPoll,
});

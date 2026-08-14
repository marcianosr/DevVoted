import { createFileRoute } from "@tanstack/react-router";

import { RunOver } from "~/modules/run/run/presentation/RunOver.component";

export const Route = createFileRoute("/_authed/run/over")({
	component: RunOver,
});

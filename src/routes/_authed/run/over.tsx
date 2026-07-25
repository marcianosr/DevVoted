import { createFileRoute } from "@tanstack/react-router";

import { RunOver } from "~/modules/run/presentation/game/RunOver.component";

export const Route = createFileRoute("/_authed/run/over")({
	component: RunOver,
});

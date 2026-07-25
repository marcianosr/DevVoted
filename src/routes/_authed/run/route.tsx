import { createFileRoute } from "@tanstack/react-router";

import { RunLayout } from "~/modules/run/presentation/game/RunLayout.component";

export const Route = createFileRoute("/_authed/run")({
	component: RunLayout,
});

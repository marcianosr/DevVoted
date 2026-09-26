import { createFileRoute } from "@tanstack/react-router";

import { RunLayout } from "~/modules/run/run/presentation/RunLayout.component";

export const Route = createFileRoute("/_authed/run")({
	component: RunLayout,
});

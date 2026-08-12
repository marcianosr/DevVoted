import { createFileRoute } from "@tanstack/react-router";

import { RunStart } from "~/modules/run/run/presentation/RunStart.component";

export const Route = createFileRoute("/_authed/run/")({
	component: RunStart,
});

import { createFileRoute } from "@tanstack/react-router";

import { RunPrep } from "~/modules/run/run/presentation/RunPrep.component";

export const Route = createFileRoute("/_authed/run/prep")({
	component: RunPrep,
});

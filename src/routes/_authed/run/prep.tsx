import { createFileRoute } from "@tanstack/react-router";

import { RunPrep } from "~/modules/run/presentation/game/RunPrep.component";

export const Route = createFileRoute("/_authed/run/prep")({
	component: RunPrep,
});

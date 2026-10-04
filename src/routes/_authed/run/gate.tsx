import { createFileRoute } from "@tanstack/react-router";

import { RunGate } from "~/modules/run/gate/presentation/RunGate.component";

export const Route = createFileRoute("/_authed/run/gate")({
	component: RunGate,
});

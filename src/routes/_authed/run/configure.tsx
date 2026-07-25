import { createFileRoute } from "@tanstack/react-router";

import { RunConfigure } from "~/modules/run/presentation/game/RunConfigure.component";

export const Route = createFileRoute("/_authed/run/configure")({
	component: RunConfigure,
});

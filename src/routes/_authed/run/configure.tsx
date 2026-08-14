import { createFileRoute } from "@tanstack/react-router";

import { RunConfigure } from "~/modules/run/pipeline/presentation/RunConfigure.component";

export const Route = createFileRoute("/_authed/run/configure")({
	component: RunConfigure,
});

import { createFileRoute } from "@tanstack/react-router";

import { RunConfigure } from "~/modules/run/build/presentation/RunConfigure.component";

export const Route = createFileRoute("/_authed/run/configure")({
	component: RunConfigure,
});

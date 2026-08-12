import { createFileRoute } from "@tanstack/react-router";

import { RunStrip } from "~/modules/run/gate/presentation/RunStrip.component";

export const Route = createFileRoute("/_authed/run/strip")({
	component: RunStrip,
});

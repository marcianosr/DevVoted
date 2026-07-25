import { createFileRoute } from "@tanstack/react-router";

import { RunStrip } from "~/modules/run/presentation/game/RunStrip.component";

export const Route = createFileRoute("/_authed/run/strip")({
	component: RunStrip,
});

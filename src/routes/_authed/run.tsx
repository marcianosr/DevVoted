import { createFileRoute } from "@tanstack/react-router";

import { RunGame } from "~/modules/run/presentation/game/RunGame.component";

export const Route = createFileRoute("/_authed/run")({
	component: RunRoute,
});

function RunRoute() {
	return <RunGame />;
}

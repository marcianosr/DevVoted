import { createFileRoute } from "@tanstack/react-router";

import { RunReward } from "~/modules/run/presentation/game/RunReward.component";

export const Route = createFileRoute("/_authed/run/reward")({
	component: RunReward,
});

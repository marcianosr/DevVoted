import { createFileRoute } from "@tanstack/react-router";

import { RunReward } from "~/modules/run/gate/presentation/RunReward.component";

export const Route = createFileRoute("/_authed/run/reward")({
	component: RunReward,
});

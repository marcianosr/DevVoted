import { createFileRoute } from "@tanstack/react-router";

import { RunReview } from "~/modules/run/presentation/game/RunReview.component";

export const Route = createFileRoute("/_authed/run/review")({
	component: RunReview,
});

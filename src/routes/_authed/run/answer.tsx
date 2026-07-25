import { createFileRoute } from "@tanstack/react-router";

import { RunAnswer } from "~/modules/run/presentation/game/RunAnswer.component";

export const Route = createFileRoute("/_authed/run/answer")({
	component: RunAnswer,
});

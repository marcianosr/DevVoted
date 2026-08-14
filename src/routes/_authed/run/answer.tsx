import { createFileRoute } from "@tanstack/react-router";

import { RunAnswer } from "~/modules/run/run/presentation/RunAnswer.component";

export const Route = createFileRoute("/_authed/run/answer")({
	component: RunAnswer,
});

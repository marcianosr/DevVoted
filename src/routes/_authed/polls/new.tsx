import { createFileRoute } from "@tanstack/react-router";

import { PollCreate } from "~/modules/polls/authoring/presentation/PollCreate.component";

export const Route = createFileRoute("/_authed/polls/new")({
	component: PollCreate,
});

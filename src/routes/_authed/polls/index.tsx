import { createFileRoute } from "@tanstack/react-router";

import { PollList } from "~/modules/polls/authoring/presentation/PollList.component";

export const Route = createFileRoute("/_authed/polls/")({
	component: PollList,
});

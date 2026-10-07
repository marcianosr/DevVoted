import { createFileRoute } from "@tanstack/react-router";

import { PollList } from "~/modules/polls/authoring/presentation/PollList.component";

const Polls = () => <PollList search={Route.useSearch()} />;

export const Route = createFileRoute("/_authed/polls/")({
	validateSearch: (search: Record<string, unknown>) => search,
	component: Polls,
});

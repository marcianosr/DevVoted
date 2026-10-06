import { createFileRoute } from "@tanstack/react-router";

import { PollEdit } from "~/modules/polls/authoring/presentation/PollEdit.component";

const EditPoll = () => {
	const { pollId } = Route.useParams();

	return <PollEdit pollId={Number(pollId)} search={Route.useSearch()} />;
};

export const Route = createFileRoute("/_authed/polls/$pollId/edit")({
	validateSearch: (search: Record<string, unknown>) => search,
	component: EditPoll,
});

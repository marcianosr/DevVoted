import { createFileRoute } from "@tanstack/react-router";

import { PollEdit } from "~/modules/polls/authoring/presentation/PollEdit.component";

const EditPoll = () => {
	const { pollId } = Route.useParams();

	return <PollEdit pollId={Number(pollId)} />;
};

export const Route = createFileRoute("/_authed/polls/$pollId/edit")({
	component: EditPoll,
});

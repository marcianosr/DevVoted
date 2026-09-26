import { createFileRoute } from "@tanstack/react-router";

import { PollDetail } from "~/modules/polls/authoring/presentation/PollDetail.component";

const Poll = () => {
	const { pollId } = Route.useParams();

	return <PollDetail pollId={Number(pollId)} />;
};

export const Route = createFileRoute("/_authed/polls/$pollId/")({
	component: Poll,
});

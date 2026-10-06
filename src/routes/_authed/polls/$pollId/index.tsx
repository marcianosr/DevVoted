import { createFileRoute } from "@tanstack/react-router";

import { PollDetail } from "~/modules/polls/authoring/presentation/PollDetail.component";

const Poll = () => {
	const { pollId } = Route.useParams();

	return <PollDetail pollId={Number(pollId)} search={Route.useSearch()} />;
};

export const Route = createFileRoute("/_authed/polls/$pollId/")({
	validateSearch: (search: Record<string, unknown>) => search,
	component: Poll,
});

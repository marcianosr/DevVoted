import { createFileRoute } from "@tanstack/react-router";
import { getPollByIdWithOptions } from "~/domains/polls/api/polls";
import { pollQueryKeys } from "~/domains/shared/queryKeys";
import { PollPageContainer } from "~/domains/polls/components/PollPageContainer";

const PollDetail: React.FC = () => {
	const { pollId } = Route.useParams();
	const { user } = Route.useRouteContext();
	const pollIdNumber = parseInt(pollId, 10);

	return (
		<PollPageContainer
			user={user}
			queryKey={pollQueryKeys.withOptions(pollIdNumber, user?.id)}
			queryFn={() =>
				getPollByIdWithOptions({
					data: { id: pollIdNumber, userId: user?.id },
				})
			}
			errorMessage="Error Loading Poll"
		/>
	);
};

export const Route = createFileRoute("/_authed/polls/$pollId")({
	component: PollDetail,
});

import { createFileRoute } from "@tanstack/react-router";
import { getDailyPoll } from "~/domains/polls/api/polls";
import { pollQueryKeys } from "~/domains/shared/queryKeys";
import { PollPageContainer } from "~/domains/polls/components/PollPageContainer";
import { getTodayDateString } from "~/lib/dateUtils";

const DailyPoll: React.FC = () => {
	const { user } = Route.useRouteContext();
	// const todayDateString = getTodayDateString();
	const todayDateString = "2025-10-23";

	const dailyPollHeader = (
		<div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
			<h2 className="text-lg font-semibold text-blue-800 mb-1">
				🌟 Daily Poll
			</h2>
			<p className="text-sm text-blue-600">
				Today's featured question - same for everyone!
			</p>
		</div>
	);

	return (
		<PollPageContainer
			user={user}
			queryKey={pollQueryKeys.daily(todayDateString, user?.id)}
			queryFn={() =>
				getDailyPoll({
					data: { userId: user?.id, date: todayDateString },
				})
			}
			errorMessage="Error Loading Daily Poll"
			headerContent={dailyPollHeader}
		/>
	);
};

export const Route = createFileRoute("/_authed/daily-poll")({
	component: DailyPoll,
});

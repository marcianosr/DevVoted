import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDailyPoll } from "~/domains/polls/api/polls";
import { pollQueryKeys } from "~/domains/shared/queryKeys";
import { PollPageContainer } from "~/domains/polls/components/PollPageContainer";
import { SimpleLeaderboard } from "~/domains/leaderboards/components/SimpleLeaderboard";
import { getTodayDateString } from "~/lib/dateUtils";

const getSimpleLeaderboard = createServerFn({ method: "GET" }).handler(
	async () => {
		const { getSimpleLeaderboardHandler } = await import(
			"~/domains/leaderboards/api/handlers"
		);
		return await getSimpleLeaderboardHandler();
	}
);

const DailyPoll: React.FC = () => {
	const { user } = Route.useRouteContext();
	// const todayDateString = getTodayDateString();
	const todayDateString = "2025-10-23";

	// Fetch leaderboard data
	const leaderboardQuery = useQuery({
		queryKey: ["leaderboard", "global"],
		queryFn: () => getSimpleLeaderboard(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	console.log(leaderboardQuery.data, "Leaderboard Data");

	const dailyPollHeader = (
		<div className="space-y-4">
			<div className="p-3 bg-blue-100 border border-blue-200 rounded-lg">
				<h2 className="text-lg font-semibold text-blue-800 mb-1">
					🌟 Daily Poll
				</h2>
				<p className="text-sm text-blue-600">
					Today's featured question - same for everyone!
				</p>
			</div>

			{/* Leaderboard Section */}
			<div className="w-full max-w-md mx-auto">
				{leaderboardQuery.isLoading && (
					<div className="bg-black border border-gray-600 rounded-lg p-4 font-mono text-sm">
						<div className="text-gray-400">
							Loading leaderboard...
						</div>
					</div>
				)}
				{leaderboardQuery.error && (
					<div className="bg-black border border-gray-600 rounded-lg p-4 font-mono text-sm">
						<div className="text-red-400">
							Failed to load leaderboard
						</div>
					</div>
				)}
				{leaderboardQuery.data?.success && (
					<SimpleLeaderboard
						entries={leaderboardQuery.data.entries}
						title="Leaderboards — Global & Category"
					/>
				)}
			</div>
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

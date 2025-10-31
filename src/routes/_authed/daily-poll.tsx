import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDailyPoll } from "~/domains/polls/api/polls";
import { pollQueryKeys } from "~/domains/shared/queryKeys";
import { PollPageContainer } from "~/domains/polls/components/PollPageContainer";
import { Leaderboard } from "~/domains/leaderboards/components/Leaderboard";
import type { CategoryCode } from "~/domains/shared/categories";

const getActiveRunCategoryCoverage = createServerFn({ method: "POST" })
	.inputValidator((data: { userId: string }) => data)
	.handler(async ({ data }) => {
		const { getActiveRunCategoryCoverageHandler } = await import(
			"~/domains/runs/api/handlers"
		);
		return await getActiveRunCategoryCoverageHandler(data.userId);
	});

const getLeaderboard = createServerFn({ method: "POST" })
	.inputValidator((data: { categoryCode?: CategoryCode }) => data)
	.handler(async ({ data }) => {
		const { getLiveRunRankingsHandler } = await import(
			"~/domains/runs/api/handlers"
		);
		return await getLiveRunRankingsHandler(data.categoryCode);
	});

const DailyPoll: React.FC = () => {
	const { user } = Route.useRouteContext();

	// Fetch active run category XP for real-time progress
	const categoryCoverageQuery = useQuery({
		queryKey: ["run", "categoryCoverage", user?.id],
		queryFn: () =>
			getActiveRunCategoryCoverage({ data: { userId: user?.id! } }),
		enabled: !!user?.id,
		staleTime: 10 * 1000, // 10 seconds - more frequent updates for real-time feel
		refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
	});

	// Fetch live leaderboard for competitive ranking (total XP)
	const leaderboardQuery = useQuery({
		queryKey: ["leaderboard", "live", "total"],
		queryFn: () => getLeaderboard({ data: {} }), // No categoryCode = total
		staleTime: 15 * 1000, // 15 seconds
		refetchInterval: 45 * 1000, // Auto-refresh every 45 seconds
	});

	const { data, isLoading, error } = useQuery({
		queryKey: ["poll", "daily", user?.id],
		queryFn: () =>
			getDailyPoll({
				data: { userId: user?.id },
			}),
		enabled: !!user?.id, // Only run when we have user ID
	});

	const pollData = data?.success ? data.data : null;

	return (
		<section data-category-theme={pollData?.poll.categoryCode}>
			<PollPageContainer
				user={user}
				queryKey={pollQueryKeys.daily(user?.id)}
				queryFn={() =>
					getDailyPoll({
						data: { userId: user?.id },
					})
				}
				errorMessage="Error Loading Daily Poll"
			/>

			{/* TODO: Refactor in own component */}
			<section className="max-w-7xl mx-auto">
				<div className="">
					{categoryCoverageQuery.isLoading && (
						<div className="bg-black border border-gray-600 p-4 text-sm">
							<div className="text-gray-400">
								Loading run progress...
							</div>
						</div>
					)}
					{categoryCoverageQuery.error && (
						<div className="bg-black border border-gray-600 p-4 text-sm">
							<div className="text-yellow-400">
								No active run - start playing to see progress!
							</div>
						</div>
					)}
				</div>

				<>
					{leaderboardQuery.isLoading && (
						<div className="bg-black border border-gray-600 p-4 text-sm">
							<div className="text-gray-400">
								Loading rankings...
							</div>
						</div>
					)}
					{leaderboardQuery.error && (
						<div className="bg-black border border-gray-600 p-4 text-sm">
							<div className="text-red-400">
								Failed to load live rankings
							</div>
						</div>
					)}
					{leaderboardQuery.data?.success &&
						leaderboardQuery.data.data &&
						pollData?.poll.categoryCode && (
							<Leaderboard
								entries={leaderboardQuery.data.data}
								currentUserId={user?.id}
								getLeaderboard={getLeaderboard}
								currentCategoryCode={pollData.poll.categoryCode}
							/>
						)}
				</>
			</section>
		</section>
	);
};

export const Route = createFileRoute("/_authed/daily-poll")({
	component: DailyPoll,
});

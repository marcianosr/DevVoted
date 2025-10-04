import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDailyPoll } from "~/domains/polls/api/polls";
import { pollQueryKeys } from "~/domains/shared/queryKeys";
import { PollPageContainer } from "~/domains/polls/components/PollPageContainer";
import { GlobalLeaderboard } from "~/domains/leaderboards/components/GlobalLeaderboard";
import { LiveLeaderboard } from "~/domains/leaderboards/components/LiveLeaderboard";
import { CategoryProgressDisplay } from "~/domains/runs/components/CategoryProgressDisplay";
import { getTodayDateString } from "~/lib/dateUtils";
import type { CategoryCode } from "~/domains/shared/categories";

const getGlobalLeaderboard = createServerFn({ method: "GET" }).handler(
	async () => {
		const { getGlobalLeaderboardHandler } = await import(
			"~/domains/leaderboards/api/handlers"
		);
		return await getGlobalLeaderboardHandler();
	}
);

const getCategoryLeaderboard = createServerFn({ method: "POST" })
	.inputValidator((data: { categoryCode?: CategoryCode }) => data)
	.handler(async ({ data }) => {
		const { getCategoryLeaderboardHandler } = await import(
			"~/domains/leaderboards/api/handlers"
		);
		return await getCategoryLeaderboardHandler({
			categoryCode: data.categoryCode,
		});
	});

const getActiveRunCategoryXp = createServerFn({ method: "POST" })
	.inputValidator((data: { userId: string }) => data)
	.handler(async ({ data }) => {
		const { getActiveRunCategoryXpHandler } = await import(
			"~/domains/runs/api/handlers"
		);
		return await getActiveRunCategoryXpHandler(data.userId);
	});

const getLiveLeaderboard = createServerFn({ method: "POST" })
	.inputValidator((data: { categoryCode?: CategoryCode }) => data)
	.handler(async ({ data }) => {
		const { getLiveRunRankingsHandler } = await import(
			"~/domains/runs/api/handlers"
		);
		return await getLiveRunRankingsHandler(data.categoryCode);
	});

const DailyPoll: React.FC = () => {
	const { user } = Route.useRouteContext();
	// const todayDateString = getTodayDateString();
	const todayDateString = "2025-10-30";

	// Fetch leaderboard data
	const leaderboardQuery = useQuery({
		queryKey: ["leaderboard", "global"],
		queryFn: () => getGlobalLeaderboard(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Fetch active run category XP for real-time progress
	const categoryXpQuery = useQuery({
		queryKey: ["run", "categoryXp", user?.id],
		queryFn: () => getActiveRunCategoryXp({ data: { userId: user?.id! } }),
		enabled: !!user?.id,
		staleTime: 10 * 1000, // 10 seconds - more frequent updates for real-time feel
		refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
	});

	// Fetch live leaderboard for competitive ranking (total XP)
	const liveLeaderboardQuery = useQuery({
		queryKey: ["leaderboard", "live", "total"],
		queryFn: () => getLiveLeaderboard({ data: {} }), // No categoryCode = total
		staleTime: 15 * 1000, // 15 seconds
		refetchInterval: 45 * 1000, // Auto-refresh every 45 seconds
	});

	return (
		<section>
			<PollPageContainer
				user={user}
				queryKey={pollQueryKeys.daily(todayDateString, user?.id)}
				queryFn={() =>
					getDailyPoll({
						data: { userId: user?.id, date: todayDateString },
					})
				}
				errorMessage="Error Loading Daily Poll"
			/>

			{/* Category Progress Section */}
			<div className="w-full max-w-md mx-auto">
				{categoryXpQuery.isLoading && (
					<div className="bg-black border border-gray-600 rounded-lg p-4 font-mono text-sm">
						<div className="text-gray-400">
							Loading run progress...
						</div>
					</div>
				)}
				{categoryXpQuery.error && (
					<div className="bg-black border border-gray-600 rounded-lg p-4 font-mono text-sm">
						<div className="text-yellow-400">
							No active run - start playing to see progress!
						</div>
					</div>
				)}
				{categoryXpQuery.data?.success && categoryXpQuery.data.data && (
					<CategoryProgressDisplay
						categoryXp={categoryXpQuery.data.data.categoryXp}
						totalXp={categoryXpQuery.data.data.totalXp}
						className="mb-4"
					/>
				)}
			</div>

			{/* Live Rankings Section */}
			<div className="w-full max-w-md mx-auto">
				{liveLeaderboardQuery.isLoading && (
					<div className="bg-black border border-gray-600 rounded-lg p-4 font-mono text-sm">
						<div className="text-gray-400">
							Loading live rankings...
						</div>
					</div>
				)}
				{liveLeaderboardQuery.error && (
					<div className="bg-black border border-gray-600 rounded-lg p-4 font-mono text-sm">
						<div className="text-red-400">
							Failed to load live rankings
						</div>
					</div>
				)}
				{liveLeaderboardQuery.data?.success &&
					liveLeaderboardQuery.data.data && (
						<LiveLeaderboard
							entries={liveLeaderboardQuery.data.data}
							currentUserId={user?.id}
							className="mb-4"
							getLiveLeaderboard={getLiveLeaderboard}
						/>
					)}
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
				{leaderboardQuery.data && (
					<GlobalLeaderboard
						entries={leaderboardQuery.data}
						title="Leaderboards — Global & Category"
						getCategoryLeaderboard={getCategoryLeaderboard}
					/>
				)}
			</div>
		</section>
	);
};

export const Route = createFileRoute("/_authed/daily-poll")({
	component: DailyPoll,
});

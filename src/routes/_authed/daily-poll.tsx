import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDailyPoll } from "~/domains/polls/api/polls";
import { PollPageContainer } from "~/domains/polls/components/PollPageContainer";
import { PrimaryButton } from "~/ui/PrimaryButton";
import { Leaderboard } from "~/domains/leaderboards/components/Leaderboard";
import type { CategoryCode } from "~/domains/shared/categories";
import { getAuthenticatedUserId } from "~/utils/authorization";
import { getActiveRunCategoryCoverageHandler } from "~/domains/runs/api/handlers";
import { ErrorComponent } from "~/ui/ErrorComponent";
import {
	LEADERBOARD_REFRESH_INTERVAL,
	CATEGORY_COVERAGE_REFRESH_INTERVAL,
} from "~/config/polling";

const getActiveRunCategoryCoverage = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return await getActiveRunCategoryCoverageHandler(userId);
	}
);

const getLeaderboard = createServerFn({ method: "POST" })
	.inputValidator((data: { categoryCode?: CategoryCode }) => data)
	.handler(async ({ data }) => {
		const { getLiveRunRankingsHandler } = await import(
			"~/domains/runs/api/handlers"
		);
		return await getLiveRunRankingsHandler(data.categoryCode);
	});

const getAllTimeLeaderboard = createServerFn({ method: "POST" })
	.inputValidator((data: { categoryCode?: CategoryCode }) => data)
	.handler(async ({ data }) => {
		const { getCategoryLeaderboardHandler } = await import(
			"~/domains/leaderboards/api/handlers"
		);
		return await getCategoryLeaderboardHandler(data);
	});

const DailyPoll: React.FC = () => {
	const { user, activeRun } = Route.useRouteContext();

	// Handle no active run state
	if (!activeRun.success || !activeRun.data?.id) {
		return (
			<div className="p-4 text-center max-w-2xl mx-auto py-8">
				<h1 className="text-3xl mb-4">No Active Run</h1>
				<p className="mb-6 text-gray-300">
					Start a new run to begin playing and answering polls!
				</p>
				<Link to="/start">
					<PrimaryButton>Start New Run</PrimaryButton>
				</Link>
			</div>
		);
	}

	// Fetch active run category XP for real-time progress
	const categoryCoverageQuery = useQuery({
		queryKey: ["run", "categoryCoverage", user?.id],
		queryFn: () => getActiveRunCategoryCoverage(),
		enabled: !!user?.id,
		staleTime: 10 * 1000, // 10 seconds - more frequent updates for real-time feel
		refetchInterval: CATEGORY_COVERAGE_REFRESH_INTERVAL,
	});

	// Fetch live leaderboard for competitive ranking (total XP)
	const leaderboardQuery = useQuery({
		queryKey: ["leaderboard", "live", "total"],
		queryFn: () => getLeaderboard({ data: {} }), // No categoryCode = total
		staleTime: 15 * 1000, // 15 seconds
		refetchInterval: LEADERBOARD_REFRESH_INTERVAL,
	});

	const { data, isLoading, error } = useQuery({
		queryKey: ["poll", "daily", user?.id],
		// TODO: remove argument
		queryFn: () => getDailyPoll(),
		enabled: !!user?.id, // Only run when we have user ID
	});

	if (isLoading) {
		return (
			<div className="text-white text-4xl h-screen flex justify-center content-center">
				Loading...
			</div>
		);
	}

	if (error || !data) {
		return <ErrorComponent text={"Error loading poll"} />;
	}

	if (!data.success) {
		return <ErrorComponent text={data.error || "Error loading poll"} />;
	}

	const poll = data.data;

	if (!user) {
		return <ErrorComponent text="User not found" />;
	}

	return (
		<section data-category-theme={poll?.poll.categoryCode}>
			<PollPageContainer user={user} poll={poll} activeRun={activeRun.data} />

			{/* TODO: Refactor in own component */}
			<section className="max-w-5xl mx-auto">
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
						poll?.poll.categoryCode && (
							<Leaderboard
								entries={leaderboardQuery.data.data}
								currentUserId={user?.id}
								getLeaderboard={getLeaderboard}
								getAllTimeLeaderboard={getAllTimeLeaderboard}
								currentCategoryCode={poll.poll.categoryCode}
							/>
						)}
				</>
			</section>
			<footer className="p-4 mt-8 bg-zinc-900 text-center text-white">
				A crazy roguelike obsession build with craftsmanship, passion,
				❤️ & Tanstack Query by Marciano Schildmeijer | EST may 2022
			</footer>
		</section>
	);
};

export const Route = createFileRoute("/_authed/daily-poll")({
	component: DailyPoll,
});

// import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

// import { createServerFn } from "@tanstack/react-start";

// import {
// 	LEADERBOARD_REFRESH_INTERVAL,
// 	CATEGORY_COVERAGE_REFRESH_INTERVAL,
// } from "~/config/polling";
// import { Leaderboard } from "~/domains/leaderboards/components/Leaderboard";
import { applyEffects } from "~/domains/configs/data/configs";
import { getDailyPoll } from "~/domains/polls/api/polls";
import DailyPollContainer, {
	getScoreBreakdown,
} from "~/domains/polls/components/DailyPollContainer";
// import { getActiveRunCategoryCoverageHandler } from "~/domains/runs/api/handlers";
// import type { CategoryCode } from "~/domains/shared/categories";
import { ErrorComponent } from "~/ui/ErrorComponent";

// import { getAuthenticatedUserId } from "~/utils/authorization";

// const getActiveRunCategoryCoverage = createServerFn({ method: "GET" }).handler(
// 	async () => {
// 		const userId = await getAuthenticatedUserId();
// 		return await getActiveRunCategoryCoverageHandler(userId);
// 	}
// );

// const getLeaderboard = createServerFn({ method: "POST" })
// 	.inputValidator((data: { categoryCode?: CategoryCode }) => data)
// 	.handler(async ({ data }) => {
// 		const { getLiveRunRankingsHandler } = await import(
// 			"~/domains/runs/api/handlers"
// 		);
// 		return await getLiveRunRankingsHandler(data.categoryCode);
// 	});

// const getAllTimeLeaderboard = createServerFn({ method: "POST" })
// 	.inputValidator((data: { categoryCode?: CategoryCode }) => data)
// 	.handler(async ({ data }) => {
// 		const { getCategoryLeaderboardHandler } = await import(
// 			"~/domains/leaderboards/api/handlers"
// 		);
// 		return await getCategoryLeaderboardHandler(data);
// 	});

const DailyPoll: React.FC = () => {
	const { user, activeRun } = Route.useRouteContext();
	const {
		poll,
		options,
		hasAnswered,
		selectedOptions,
		creatorDisplayName,
		score,
		configEffects,
	} = Route.useLoaderData();

	// Fetch active run category XP for real-time progress
	// const categoryCoverageQuery = useQuery({
	// 	queryKey: ["run", "categoryCoverage", user?.id],
	// 	queryFn: () => getActiveRunCategoryCoverage(),
	// 	enabled: !!user?.id,
	// 	staleTime: 10 * 1000, // 10 seconds - more frequent updates for real-time feel
	// 	refetchInterval: CATEGORY_COVERAGE_REFRESH_INTERVAL,
	// });

	// // Fetch live leaderboard for competitive ranking (total XP)
	// const leaderboardQuery = useQuery({
	// 	queryKey: ["leaderboard", "live", "total"],
	// 	queryFn: () => getLeaderboard({ data: {} }), // No categoryCode = total
	// 	staleTime: 15 * 1000, // 15 seconds
	// 	refetchInterval: LEADERBOARD_REFRESH_INTERVAL,
	// });

	// Type narrowing: beforeLoad ensures activeRun exists and has success=true
	if (!user || !activeRun?.success) {
		return <ErrorComponent text="User not found" />;
	}

	return (
		<section data-category-theme={poll.categoryCode}>
			<DailyPollContainer
				poll={poll}
				options={options}
				hasAnswered={hasAnswered}
				activeRun={activeRun.data}
				selectedOptions={selectedOptions}
				score={score}
				configEffects={configEffects}
				creatorDisplayName={creatorDisplayName}
			/>
			{/* <PollPageContainer
				user={user}
				poll={{
					poll: poll,
					options: options,
					hasAnswered: hasAnswered,
				}}
				activeRun={activeRun.data}
			/> */}

			{/* TODO: Refactor in own component */}
			{/* <section className="max-w-5xl mx-auto">
				<div className="">
					{categoryCoverageQuery.isLoading && (
						<div className="bg-black border border-gray-600 p-4 text-sm">
							<div className="text-gray-400">Loading run progress...</div>
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
							<div className="text-gray-400">Loading rankings...</div>
						</div>
					)}
					{leaderboardQuery.error && (
						<div className="bg-black border border-gray-600 p-4 text-sm">
							<div className="text-red-400">Failed to load live rankings</div>
						</div>
					)}
					{leaderboardQuery.data?.success && leaderboardQuery.data.data && (
						<Leaderboard
							entries={leaderboardQuery.data.data}
							currentUserId={user?.id}
							getLeaderboard={getLeaderboard}
							getAllTimeLeaderboard={getAllTimeLeaderboard}
							currentCategoryCode={poll.categoryCode}
						/>
					)}
				</>
			</section> */}
			<footer className="p-4 mt-8 bg-zinc-900 text-center text-white">
				A crazy roguelike obsession build with craftsmanship, passion, ❤️ &
				Tanstack Start by Marciano Schildmeijer | EST may 2022
			</footer>
		</section>
	);
};

export const Route = createFileRoute("/_authed/daily-poll/")({
	component: DailyPoll,
	beforeLoad: async ({ context }) => {
		if (!context.activeRun?.success || !context.activeRun?.data?.id) {
			throw redirect({
				to: "/start",
			});
		}
	},
	loader: async ({ context: { activeRun } }) => {
		if (!activeRun?.success) {
			throw new Error("No active run");
		}

		const pollResponse = await getDailyPoll();

		if (!pollResponse.success) {
			throw new Error(pollResponse.error);
		}

		const score = await getScoreBreakdown({
			data: {
				poll: pollResponse.data.poll,
				options: pollResponse.data.options,
				hasAnswered: pollResponse.data.hasAnswered,
				run: activeRun.data,
				selectedOptions: pollResponse.data.selectedOptions,
			},
		});

		return {
			poll: pollResponse.data.poll,
			options: pollResponse.data.options,
			hasAnswered: pollResponse.data.hasAnswered,
			selectedOptions: pollResponse.data.selectedOptions,
			creatorDisplayName: pollResponse.data.creatorDisplayName,
			score,
			configEffects: applyEffects(
				{
					poll: pollResponse.data.poll,
					options: pollResponse.data.options,
					hasAnswered: pollResponse.data.hasAnswered,
					run: activeRun.data,
				},
				activeRun.data.activeConfigIds
			),
		};
	},
	pendingComponent: () => (
		<section className="max-w-5xl mx-auto p-4">
			<div className="animate-pulse">Loading poll...</div>
		</section>
	),
	pendingMs: 300,
	errorComponent: () => {
		return (
			<section className="max-w-5xl mx-auto">
				<h1 className="text-red-500 text-3xl">Error loading poll</h1>
			</section>
		);
	},
});

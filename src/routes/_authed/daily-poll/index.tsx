import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import Content from "~/components/Content";
import { DevPollNavigator } from "~/components/DevPollNavigator";
import { applyEffects } from "~/domains/configs/data/configs";
import { getShopOfferingsServerFn } from "~/domains/economy/api/shopOfferings";
import { getCurrentGate as getCurrentGateServerFn } from "~/domains/gates/api/gates";
import { getCurrentGateDefinition } from "~/domains/gates/services/gateDefinition.service";
import { getDailyPoll } from "~/domains/polls/api/polls";
import DailyPollContainer, {
	getScoreBreakdown,
} from "~/domains/polls/components/DailyPollContainer";
import { getTodayDateString } from "~/lib/dateUtils";
import { ErrorComponent } from "~/ui/ErrorComponent";

// const getActiveRunCategoryCoverage = createServerFn({ method: "GET" }).handler(
// 	async () => {
// 		const userId = await getAuthenticatedUserId();
// 		return await getActiveRunCategoryCoverageHandler(userId);
// 	}
// );

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
		isAdmin,
		score,
		configEffects,
		currentGate,
		currentGateTypeCode,
		currentGateNumber,
		offeredConfigs,
		currentDate,
	} = Route.useLoaderData();
	const { date } = Route.useSearch();

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
		<Content poll={poll}>
			<DevPollNavigator currentDate={currentDate} hasCustomDate={!!date} />
			<DailyPollContainer
				poll={poll}
				options={options}
				hasAnswered={hasAnswered}
				activeRun={activeRun.data}
				selectedOptions={selectedOptions}
				score={score}
				configEffects={configEffects}
				creatorDisplayName={creatorDisplayName}
				currentGate={currentGate}
				currentGateTypeCode={currentGateTypeCode}
				currentGateNumber={currentGateNumber}
				isAdmin={isAdmin}
				offeredConfigs={offeredConfigs}
			/>

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
		</Content>
	);
};

const searchParamsSchema = z.object({
	date: z.string().optional(),
});

export const Route = createFileRoute("/_authed/daily-poll/")({
	component: DailyPoll,
	validateSearch: searchParamsSchema,
	loaderDeps: ({ search }) => ({ date: search.date }),
	beforeLoad: async ({ context }) => {
		if (!context.activeRun?.success || !context.activeRun?.data?.id) {
			throw redirect({
				to: "/start",
			});
		}
	},
	loader: async ({ context: { activeRun }, deps }) => {
		if (!activeRun?.success) {
			throw new Error("No active run");
		}

		const currentDate = deps.date || getTodayDateString();

		// Fetch current gate info from database (includes gate type)
		const currentGateInfo = await getCurrentGateServerFn({
			data: { runId: activeRun.data.id },
		});

		// Build gate definition from current gate type
		const currentGate = getCurrentGateDefinition(
			currentGateInfo.gateType,
			currentGateInfo.gateNumber
		);

		const pollResponse = await getDailyPoll({
			data: { runId: activeRun.data.id, date: deps.date },
		});

		if (!pollResponse.success) {
			throw new Error(pollResponse.error);
		}

		const configEffects = applyEffects(
			{
				poll: pollResponse.data.poll,
				options: pollResponse.data.options,
				hasAnswered: pollResponse.data.hasAnswered,
				run: activeRun.data,
			},
			activeRun.data.activeConfigIds
		);

		const shopOfferingsResult = await getShopOfferingsServerFn({
			data: { runId: activeRun.data.id, date: currentDate },
		});
		const offeredConfigs = shopOfferingsResult.success
			? shopOfferingsResult.data
			: [];

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
			isAdmin: pollResponse.isAdmin,
			score,
			configEffects,
			currentGate,
			currentGateTypeCode: currentGateInfo.gateType.code,
			currentGateNumber: currentGateInfo.gateNumber,
			offeredConfigs,
			currentDate,
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

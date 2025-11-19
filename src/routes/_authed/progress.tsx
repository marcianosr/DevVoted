import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getDailyPoll, getTotalPollsSeen } from "~/domains/polls/api/polls";
import { CategoryCoverageGrid } from "~/domains/runs/components/CategoryCoverageGrid";
import { requiresActiveRun } from "~/domains/runs/guards/requiresActiveRun";
import {
	calculateThresholdInfo,
	ThresholdInfo,
} from "~/domains/runs/services/thresholdCalculator.service";
import { pollQueryKeys } from "~/domains/shared/queryKeys";
import { CiGatePanel } from "~/ui/CiGatePanel";
import { ErrorComponent } from "~/ui/ErrorComponent";
import { LoadingSkeleton } from "~/ui/LoadingSkeleton";

export const Route = createFileRoute("/_authed/progress")({
	component: ProgressPage,
	beforeLoad: async () => {
		const activeRun = await requiresActiveRun();
		return { activeRun };
	},
});

function ProgressPage() {
	const { activeRun, user } = Route.useRouteContext();

	const { data, isLoading, error } = useQuery({
		queryKey: pollQueryKeys.daily(user?.id),
		queryFn: () => getDailyPoll(),
		enabled: !!user?.id, // Only run when we have user ID
	});

	const {
		data: totalPollsSeenData,
		isLoading: isLoadingTotalPollsSeenData,
		error: totalPollsSeenError,
	} = useQuery({
		queryKey: pollQueryKeys.totalSeen(user?.id),
		queryFn: () => getTotalPollsSeen(),
		enabled: !!user?.id,
	});

	if (totalPollsSeenError || error) {
		return <ErrorComponent text={"Error loading poll"} />;
	}

	if (isLoadingTotalPollsSeenData || isLoading) {
		return <LoadingSkeleton />;
	}

	if (!totalPollsSeenData?.success || !data?.success) {
		return <ErrorComponent text={"Error loading data"} />;
	}

	const thresholdInfo = calculateThresholdInfo(
		activeRun.categoryCoverage,
		totalPollsSeenData.data
	);

	return (
		<section className={`max-w-4xl mx-auto mt-16`}>
			<h1 className="text-4xl mb-6">Run Progress</h1>
			<section className="border-b-1 border-white py-4 mt-4 ">
				<h2 className="text-2xl mb-2">CI builds progress</h2>
				<CiGatePanel
					thresholdInfo={thresholdInfo}
					categoryCoverage={activeRun.categoryCoverage}
				/>
			</section>
			<section className="border-b-1 border-white py-4 mt-4">
				<h2 className="text-2xl mb-2">Run Category Coverage</h2>
				<CategoryCoverageGrid
					categoryCoverage={activeRun.categoryCoverage}
					currentCategoryCode={data.data.poll.categoryCode}
				/>
			</section>

			<section className="border-b-1 border-white py-4 mt-4">
				<h2 className="text-3xl mb-4">Poll timeline this run</h2>
				<div className="flex gap-4 mb-4">
					{[
						{
							status: "answered",
							category: "TypeScript",
							isToday: false,
						},
						{
							status: "answered",
							category: "JavaScript",
							isToday: false,
						},
						{ status: "answered", category: "CSS", isToday: false },
						{
							status: "answered",
							category: "JavaScript",
							isToday: true,
						},
						{
							status: "unanswered",
							category: "???",
							isToday: false,
						},
					].map((poll, index) => (
						<div
							key={index}
							className="flex flex-col items-center w-16"
						>
							<div
								className={`
									w-4 h-4 rounded-full flex items-center justify-center
									${
										poll.isToday
											? "border-2 border-yellow-400 bg-transparent"
											: poll.status === "answered"
												? "bg-white"
												: "border-2 border-gray-600 bg-transparent"
									}
								`}
							></div>
							<span
								className={`mt-2 text-xs text-center ${poll.isToday ? "text-yellow-400" : ""}`}
							>
								{poll.category}
							</span>
							{poll.isToday && (
								<span className="text-xs text-yellow-400">
									(today)
								</span>
							)}
						</div>
					))}
				</div>
			</section>
		</section>
	);
}

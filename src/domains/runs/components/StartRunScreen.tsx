import { formatDistance } from "date-fns";
import { RunEndStats, type Reason } from "./RunEndStats";
import { useLastRun } from "~/domains/runs/hooks/useLastRun";
import { PrimaryButton } from "~/ui/PrimaryButton";

interface StartRunScreenProps {
	isStarting: boolean;
	onStartRun: () => void;
	userId?: string;
}

export const StartRunScreen: React.FC<StartRunScreenProps> = ({
	isStarting,
	onStartRun,
	userId,
}) => {
	const { lastRunData, isLoading, hasLastRun } = useLastRun(userId);

	const formatDuration = (startDate: Date | null, endDate: Date | null) => {
		if (!startDate || !endDate) return "Unknown";

		return formatDistance(startDate, endDate, { includeSeconds: true });
	};

	return (
		<div className="p-4">
			<div className="mx-auto max-w-2xl py-8">
				<h1 className="text-4xl mb-4">
					Welcome to the developer roguelike!
				</h1>

				{isLoading && (
					<div className="text-center py-4">
						<div>Loading last run...</div>
					</div>
				)}

				{hasLastRun && lastRunData && !isLoading && (
					<div className="mb-8">
						<RunEndStats
							totalCoverage={lastRunData.totalCoverage}
							totalPollsAnswered={lastRunData.totalPollsAnswered}
							categoryCoverage={lastRunData.categoryCoverage}
							duration={formatDuration(
								lastRunData.run.started_at,
								lastRunData.run.finished_at
							)}
							reason={lastRunData.run.completion_reason as Reason}
						/>
					</div>
				)}

				<h2 className="text-xl mb-4">
					{hasLastRun
						? "Ready for another run?"
						: "To get started, click the button below to start your run!"}
				</h2>
				<section className="text-white mb-6">
					<h3 className="mt-4 text-2xl">How it works:</h3>
					<ul>
						<li>- Each day a new poll appears in a category</li>
						<li>
							- Answering polls increases your coverage for each
							category
						</li>
						<li>
							- Answering wrong answers will decrease your
							coverage
						</li>
						<li>
							- Meeting a CI gate allows you to continue the run
						</li>
						<li>- Failing a CI gate ends your run</li>
						<li>
							- Configs (so-called "modifiers") are installed from
							the{" "}
							<span className="underline">Package Manager</span>{" "}
							and can help you increase your coverage. Use them
							wisely!
						</li>
						<li>- Compete with others on the leaderboard!</li>
					</ul>
					<p className="mt-8">
						Answer polls and earn coverage to beat the CI gates!
						Each run you start with 0% coverage. Can you beat all CI
						Gates? And can you get to{" "}
						<span className="text-yellow-500 underline">100%</span>{" "}
						coverage?
					</p>
				</section>
				<PrimaryButton
					onClick={onStartRun}
					disabled={isStarting}
					className="px-6 py-3"
				>
					{isStarting ? "Starting Run..." : "Start a new run"}
				</PrimaryButton>
			</div>
		</div>
	);
};

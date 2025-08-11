import { formatDistance } from "date-fns";
import { RunEndStats } from "./RunEndStats";
import { useLastRun } from "~/domains/runs/hooks/useLastRun";


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
			<h1 className="text-2xl font-bold mb-4">Start Your Quiz Run</h1>
			
			{isLoading && (
				<div className="text-center py-4">
					<div>Loading last run...</div>
				</div>
			)}

			{hasLastRun && lastRunData && !isLoading && (
				<div className="mb-8">
					<RunEndStats
						totalXp={lastRunData.totalXp}
						totalPollsAnswered={lastRunData.totalPollsAnswered}
						categoryXp={lastRunData.categoryXp}
						duration={formatDuration(
							lastRunData.run.started_at,
							lastRunData.run.finished_at
						)}
					/>
				</div>
			)}

			<div className="text-center py-8">
				<h2 className="text-xl mb-4">
					{hasLastRun ? "Ready for another run?" : "You need an active run to answer polls"}
				</h2>
				<p className="text-gray-600 mb-6">
					Each run starts with 0 XP in all categories. Answer polls
					correctly to earn XP and build your streak!
				</p>
				<button
					onClick={onStartRun}
					disabled={isStarting}
					className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isStarting ? "Starting Run..." : "Start New Run"}
				</button>
			</div>
		</div>
	);
};
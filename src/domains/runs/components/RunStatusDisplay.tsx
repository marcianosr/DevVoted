import { calculateNextPollThresholdFromCategoryData } from "~/domains/runs/services/thresholdCalculator.service";
import type { RunCategoryXp } from "~/domains/runs/models/runCategoryXp";
import type { Run } from "~/domains/runs/models/run";
import { ThresholdDisplay } from "./ThresholdDisplay";
import { CategoryXpGrid } from "./CategoryXpGrid";

interface RunStatusDisplayProps {
	activeRun: Run | null;
}

export const RunStatusDisplay: React.FC<RunStatusDisplayProps> = ({
	activeRun,
}) => {
	if (!activeRun) return null;

	const thresholdInfo = activeRun.categoryXp
		? calculateNextPollThresholdFromCategoryData(
				activeRun.categoryXp.map((xp: RunCategoryXp) => ({
					currentXp: xp.currentXp,
					pollsAnswered: xp.pollsAnswered,
				}))
			)
		: null;

	return (
		<div className="mb-6 p-4 rounded-lg border border-white">
			<h3 className="text-lg font-semibold text-white mb-3">
				Current Run Status
			</h3>
			<div className="text-sm text-white mb-3">
				Started: {new Date(activeRun.startedAt).toLocaleString()}
			</div>

			{thresholdInfo && (
				<div className="mb-4">
					<div className="text-sm text-white mb-2">
						<span className="font-medium">
							Set {thresholdInfo.currentSet}
						</span>
						{" - "}
						<span>Poll {thresholdInfo.pollInSet}/3</span>
						{thresholdInfo.isThresholdCheckPoll && (
							<span className="ml-2 px-2 py-1 bg-yellow-600 text-yellow-100 rounded text-xs font-medium">
								⚡ THRESHOLD CHECK
							</span>
						)}
					</div>
					<ThresholdDisplay thresholdInfo={thresholdInfo} />
				</div>
			)}

			{activeRun.categoryXp && (
				<CategoryXpGrid categoryXp={activeRun.categoryXp} />
			)}
		</div>
	);
};

import { calculateNextPollThresholdFromCategoryData } from "~/domains/userPerformance/services/thresholdCalculator.service";
import type { RunData } from "~/domains/runs/hooks";
import type { RunCategoryXp } from "~/domains/runs/models/runCategoryXp";
import { ThresholdDisplay } from "./ThresholdDisplay";
import { CategoryXpGrid } from "./CategoryXpGrid";

interface RunStatusDisplayProps {
	activeRun: RunData;
}

export const RunStatusDisplay: React.FC<RunStatusDisplayProps> = ({
	activeRun,
}) => {
	const thresholdInfo = activeRun?.categoryXp
		? calculateNextPollThresholdFromCategoryData(
				activeRun.categoryXp.map((xp: RunCategoryXp) => ({
					currentXp: xp.currentXp,
					pollsAnswered: xp.pollsAnswered,
				}))
			)
		: null;

	return (
		<div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
			<h3 className="text-lg font-semibold text-blue-900 mb-3">
				Current Run Status
			</h3>
			<div className="text-sm text-blue-700 mb-3">
				Started:{" "}
				{new Date(activeRun.run?.startedAt || "").toLocaleString()}
			</div>

			{thresholdInfo && <ThresholdDisplay thresholdInfo={thresholdInfo} />}

			{activeRun.categoryXp && (
				<CategoryXpGrid categoryXp={activeRun.categoryXp} />
			)}
		</div>
	);
};
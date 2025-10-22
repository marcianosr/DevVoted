import type { Run } from "~/domains/runs/models/run";
import type { PollScoreBreakdown } from "~/domains/score/services/score.service";
import { CategoryCoverageGrid } from "./CategoryCoverageGrid";
import { ScoreBreakdownSidebar } from "./ScoreBreakdownSidebar";

interface RunStatusDisplayProps {
	activeRun: Run | null;
	currentCategoryCode?: string;
	lastScoreBreakdown?: PollScoreBreakdown | null;
}

export const RunStatusDisplay: React.FC<RunStatusDisplayProps> = ({
	activeRun,
	currentCategoryCode,
	lastScoreBreakdown,
}) => {
	if (!activeRun) return null;

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-semibold text-saffron mb-2">
					Run info
				</h3>

				<div className="text-xs text-white mb-4">
					Started: {new Date(activeRun.startedAt).toLocaleString()}
				</div>
			</div>

			{lastScoreBreakdown && (
				<ScoreBreakdownSidebar
					breakdown={lastScoreBreakdown}
				/>
			)}

			{activeRun.categoryCoverage && (
				<CategoryCoverageGrid
					categoryCoverage={activeRun.categoryCoverage}
					currentCategoryCode={currentCategoryCode}
				/>
			)}
		</div>
	);
};

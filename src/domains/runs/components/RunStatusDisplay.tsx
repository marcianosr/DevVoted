import type { Run } from "~/domains/runs/models/run";
import type { PollScoreBreakdown } from "~/domains/score/services/score.service";
import { CategoryCoverageGrid } from "./CategoryCoverageGrid";
import { ScoreBreakdownSidebar } from "./ScoreBreakdownSidebar";
import { useCurrentSeason } from "~/domains/seasons/hooks/useCurrentSeason";
import { SeasonInfo } from "~/domains/seasons/components/SeasonInfo";

type RunStatusDisplayProps = {
	activeRun: Run;
	currentCategoryCode?: string;
	// lastScoreBreakdown?: PollScoreBreakdown | null;
};

export const RunStatusDisplay: React.FC<RunStatusDisplayProps> = ({
	activeRun,
	currentCategoryCode,
	// lastScoreBreakdown,
}) => {
	// const { data: seasonData } = useCurrentSeason();

	return (
		<div className="space-y-4">
			{/* {seasonData?.success && seasonData.data && (
				<SeasonInfo season={seasonData.data} />
			)} */}

			<div className="border-t border-theme pt-4">
				<h3 className="text-lg font-semibold text-theme mb-2">
					Run info
				</h3>

				<div className="text-xs text-white mb-4">
					Started: {new Date(activeRun.startedAt).toLocaleString()}
				</div>
			</div>

			{/* {lastScoreBreakdown && (
				<ScoreBreakdownSidebar breakdown={lastScoreBreakdown} />
			)} */}

			<CategoryCoverageGrid
				categoryCoverage={activeRun.categoryCoverage}
				currentCategoryCode={currentCategoryCode}
			/>
		</div>
	);
};

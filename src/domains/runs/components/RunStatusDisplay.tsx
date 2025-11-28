import { format } from "date-fns";

import type { Run } from "~/domains/runs/models/run";
import { SeasonInfo } from "~/domains/seasons/components/SeasonInfo";
import { useCurrentSeason } from "~/domains/seasons/hooks/useCurrentSeason";

import { CategoryCoverageGrid } from "./CategoryCoverageGrid";

interface RunStatusDisplayProps {
	activeRun: Run | null;
	currentCategoryCode?: string;
}

export const RunStatusDisplay: React.FC<RunStatusDisplayProps> = ({
	activeRun,
	currentCategoryCode,
}) => {
	const { data: seasonData } = useCurrentSeason();

	if (!activeRun) return null;

	return (
		<div className="space-y-4">
			{seasonData?.success && seasonData.data && (
				<SeasonInfo season={seasonData.data} />
			)}

			<div className="border-t border-theme pt-4">
				<h3 className="text-lg font-semibold text-theme mb-2">Run info</h3>

				<div className="text-xs text-white mb-4">
					Started:{" "}
					{format(new Date(activeRun.startedAt), "MM/dd/yyyy, HH:mm:ss")}
				</div>
			</div>

			<CategoryCoverageGrid
				categoryCoverage={activeRun.categoryCoverage}
				currentCategoryCode={currentCategoryCode}
			/>
		</div>
	);
};

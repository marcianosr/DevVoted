import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";
import { CATEGORY_METADATA } from "~/domains/shared/categories";
import { aggregateRunCategoryCoverage } from "~/domains/runs/utils/coverageCalculations";

type CategoryCoverageGridProps = {
	categoryCoverage: RunCategoryCoverage[];
};

export const CategoryCoverageGrid: React.FC<CategoryCoverageGridProps> = ({
	categoryCoverage,
}) => {
	const { totalCoverage, totalPollsAnswered } =
		aggregateRunCategoryCoverage(categoryCoverage);

	return (
		<>
			<div className="grid grid-cols-3 gap-2 text-sm border-b border-saffron pb-2 mb-2">
				<span>Category</span>
				<span>Coverage</span>
				<span>Streak</span>
			</div>

			{categoryCoverage.map((coverage: RunCategoryCoverage) => (
				<ul className="grid grid-cols-3 gap-2 text-sm">
					<li key="categoryCode">
						{CATEGORY_METADATA[coverage.categoryCode].name}
					</li>
					<li key="currentCoverage">{coverage.currentCoverage}%</li>
					<li key="currentStreak" className="flex gap-2">
						{coverage.currentStreak}
						{coverage.bestStreak > 0 && <span>🌟</span>}
					</li>
				</ul>
			))}
			<div className="mt-4 pt-4 border-t-1 border-saffron">
				Total: {totalCoverage}% coverage • {totalPollsAnswered} polls
				answered
			</div>
		</>
	);
};

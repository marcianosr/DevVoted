import { clsx } from "clsx";

import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";
import { CATEGORY_METADATA } from "~/domains/shared/categories";

type CategoryCoverageGridProps = {
	categoryCoverage: RunCategoryCoverage[];
	currentCategoryCode?: string;
};

export const CategoryCoverageGrid: React.FC<CategoryCoverageGridProps> = ({
	categoryCoverage,
	currentCategoryCode,
}) => {
	const highestBestStreak = Math.max(
		...categoryCoverage.map((c) => c.bestStreak)
	);

	return (
		<div className="space-y-2">
			<h3 className="text-xl">Coverage score overview</h3>

			<div className="grid grid-cols-4 gap-2 text-sm border-b border-theme pb-2">
				<span>Category</span>
				<span>Coverage</span>
				<span>Streak</span>
				<span>Best Streak</span>
			</div>

			<div className="space-y-1">
				{categoryCoverage.map((coverage: RunCategoryCoverage) => {
					const isCurrentCategory =
						coverage.categoryCode === currentCategoryCode;

					return (
						<div
							key={coverage.categoryCode}
							className={clsx("grid grid-cols-4 gap-2 text-sm pl-2", {
								"bg-theme/10 border-l-4 border-theme": isCurrentCategory,
								"hover:bg-gray-800/50": !isCurrentCategory,
							})}
							aria-current={isCurrentCategory ? "true" : undefined}
						>
							<span
								className={clsx("self-center", {
									"text-theme": isCurrentCategory,
								})}
							>
								{CATEGORY_METADATA[coverage.categoryCode].name}
							</span>
							<div className="flex flex-col gap-0">
								<span
									className={clsx({
										"text-theme": isCurrentCategory,
									})}
								>
									{coverage.currentCoverage.toFixed(1)}%
								</span>
								<meter
									className="w-full h-2"
									min="0"
									max="100"
									value={coverage.currentCoverage}
								/>
							</div>
							<div className="flex gap-2">
								<span
									className={clsx("self-center", {
										"text-theme": isCurrentCategory,
									})}
								>
									{coverage.currentStreak}
								</span>
							</div>
							<div className="flex gap-2">
								<span
									className={clsx("self-center", {
										"text-theme": isCurrentCategory,
									})}
								>
									{coverage.bestStreak === highestBestStreak &&
										highestBestStreak > 0 && <>★</>}{" "}
									{coverage.bestStreak}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

import { CATEGORY_METADATA } from "~/domains/shared/categories";
import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage.model";
import { CategoryCoverageGridUI } from "~/ui/runs/CategoryCoverageGrid.ui";

type CategoryCoverageGridProps = {
	categoryCoverage: RunCategoryCoverage[];
	currentCategoryCode?: string;
};

export const CategoryCoverageGrid = ({
	categoryCoverage,
	currentCategoryCode,
}: CategoryCoverageGridProps) => {
	const highestBestStreak = Math.max(
		...categoryCoverage.map((c) => c.bestStreak)
	);

	const entries = categoryCoverage.map((coverage) => ({
		code: coverage.categoryCode,
		name: CATEGORY_METADATA[coverage.categoryCode].name,
		currentCoverage: coverage.currentCoverage,
		currentStreak: coverage.currentStreak,
		bestStreak: coverage.bestStreak,
		isBestStreak: coverage.bestStreak === highestBestStreak,
		isCurrent: coverage.categoryCode === currentCategoryCode,
	}));

	return <CategoryCoverageGridUI entries={entries} />;
};

import { updateUserCategoryProgressionIfBetter } from "~/domains/runs/api/queries";
import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";
import { calculateLevelAndCoverage } from "~/domains/runs/utils/levelCalculations";
import type { CategoryCode } from "~/domains/shared/categories";

/**
 * Updates user's global category progression based on a completed run's coverage
 * For each category in the run, calculates the level and updates the user's
 * best level if this run achieved a new personal best.
 *
 * @param userId - The user's ID
 * @param categoryCoverage - Array of category coverage data from the completed run
 */
export const updateUserProgressionFromRun = async (
	userId: string,
	categoryCoverage: readonly RunCategoryCoverage[]
) => {
	const updates = categoryCoverage.map((coverage) => {
		const { level, effectiveCoverage } = calculateLevelAndCoverage(
			coverage.currentCoverage
		);

		return updateUserCategoryProgressionIfBetter(
			userId,
			coverage.categoryCode as CategoryCode,
			level,
			effectiveCoverage
		);
	});

	await Promise.all(updates);
};

import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage.model";

/**
 * Aggregates total coverage and polls answered from category coverage data
 * @param categoryCoverage - Array of category coverage data
 * @returns Object with totalCoverage and totalPollsAnswered
 */
export const aggregateRunCategoryCoverage = (
	categoryCoverage: readonly RunCategoryCoverage[]
) => {
	const totalCoverage = categoryCoverage.reduce(
		(sum, coverage) => sum + coverage.currentCoverage,
		0
	);
	const totalPollsAnswered = categoryCoverage.reduce(
		(sum, coverage) => sum + coverage.pollsAnswered,
		0
	);

	return { totalCoverage, totalPollsAnswered };
};

import type { RunCategoryXp } from "~/domains/runs/models/runCategoryXp";

/**
 * Aggregates total coverage and polls answered from category XP data
 * @param categoryXp - Array of category XP data
 * @returns Object with totalCoverage and totalPollsAnswered
 */
export const aggregateRunCategoryXp = (
	categoryXp: readonly RunCategoryXp[]
) => {
	const totalCoverage = categoryXp.reduce(
		(sum, xp) => sum + xp.currentCoverage,
		0
	);
	const totalPollsAnswered = categoryXp.reduce(
		(sum, xp) => sum + xp.pollsAnswered,
		0
	);

	return { totalCoverage, totalPollsAnswered };
};

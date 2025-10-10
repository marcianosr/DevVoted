import type { RunCategoryXp } from "~/domains/runs/models/runCategoryXp";

/**
 * Aggregates total XP and polls answered from category XP data
 * @param categoryXp - Array of category XP data
 * @returns Object with totalXp and totalPollsAnswered
 */
export const aggregateRunCategoryXp = (
	categoryXp: readonly RunCategoryXp[]
) => {
	const totalXp = categoryXp.reduce((sum, xp) => sum + xp.currentXp, 0);
	const totalPollsAnswered = categoryXp.reduce(
		(sum, xp) => sum + xp.pollsAnswered,
		0
	);

	return { totalXp, totalPollsAnswered };
};

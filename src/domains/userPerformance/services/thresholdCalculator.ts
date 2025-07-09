import { calculateXpThreshold } from "../constants/xpSystem";

/**
 * Threshold calculation result
 */
export type ThresholdInfo = {
	readonly meetsThreshold: boolean;
	readonly currentXp: number;
	readonly requiredXp: number;
	readonly pollNumber: number;
};

/**
 * Run category XP data for threshold calculations
 */
export type CategoryXpData = {
	readonly currentXp: number;
	readonly pollsAnswered: number;
};

/**
 * Core threshold calculation logic
 * @param totalXp - Total XP across all categories
 * @param totalPollsAnswered - Total polls answered across all categories
 * @returns Threshold information
 */
export const calculateThresholdInfo = (
	totalXp: number,
	totalPollsAnswered: number
): ThresholdInfo => {
	// Poll number is the current poll we just answered
	const requiredXp = calculateXpThreshold(totalPollsAnswered);

	return {
		meetsThreshold: totalXp >= requiredXp,
		currentXp: totalXp,
		requiredXp,
		pollNumber: totalPollsAnswered,
	};
};


/**
 * Aggregate XP data from multiple categories
 * @param categoryData - Array of category XP data
 * @returns Aggregated totals
 */
export const aggregateCategoryXpData = (categoryData: readonly CategoryXpData[]) => {
	const totalXp = categoryData.reduce((sum, data) => sum + data.currentXp, 0);
	const totalPollsAnswered = categoryData.reduce((sum, data) => sum + data.pollsAnswered, 0);
	return { totalXp, totalPollsAnswered };
};

/**
 * Calculate threshold for next poll from category data (client-side display)
 * @param categoryXpData - Array of category XP data
 * @returns Threshold information for the next poll
 */
export const calculateNextPollThresholdFromCategoryData = (
	categoryXpData: readonly CategoryXpData[]
): ThresholdInfo => {
	const { totalXp, totalPollsAnswered } = aggregateCategoryXpData(categoryXpData);
	
	// Poll number is the next poll (current + 1)
	const pollNumber = totalPollsAnswered + 1;
	const requiredXp = calculateXpThreshold(pollNumber);

	return {
		meetsThreshold: totalXp >= requiredXp,
		currentXp: totalXp,
		requiredXp,
		pollNumber,
	};
};

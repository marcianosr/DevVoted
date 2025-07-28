import { 
	shouldCheckThreshold,
	getCurrentSetNumber,
	getPollPositionInSet,
	calculateSetThreshold 
} from "../constants/xpSystem";

/**
 * Threshold calculation result
 */
export type ThresholdInfo = {
	readonly meetsThreshold: boolean;
	readonly currentXp: number;
	readonly requiredXp: number;
	readonly pollNumber: number;
	readonly currentSet: number;
	readonly pollInSet: number;
	readonly isThresholdCheckPoll: boolean;
};

/**
 * Run category XP data for threshold calculations
 */
export type CategoryXpData = {
	readonly currentXp: number;
	readonly pollsAnswered: number;
};

/**
 * Core threshold calculation logic using 3-poll sets
 * @param totalXp - Total XP across all categories
 * @param totalPollsAnswered - Total polls answered across all categories
 * @returns Threshold information
 */
export const calculateThresholdInfo = (
	totalXp: number,
	totalPollsAnswered: number
): ThresholdInfo => {
	const currentSet = getCurrentSetNumber(totalPollsAnswered);
	const pollInSet = getPollPositionInSet(totalPollsAnswered);
	const isThresholdCheckPoll = shouldCheckThreshold(totalPollsAnswered);
	
	// Always show the threshold required for the current set
	const requiredXp = calculateSetThreshold(currentSet);
	
	// Only enforce threshold check on 3rd poll of each set
	const meetsThreshold = isThresholdCheckPoll 
		? totalXp >= requiredXp 
		: true; // Not a threshold check poll, so always passes
	
	return {
		meetsThreshold,
		currentXp: totalXp,
		requiredXp,
		pollNumber: totalPollsAnswered,
		currentSet,
		pollInSet,
		isThresholdCheckPoll,
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
	const currentSet = getCurrentSetNumber(pollNumber);
	const pollInSet = getPollPositionInSet(pollNumber);
	const isThresholdCheckPoll = shouldCheckThreshold(pollNumber);
	
	// Show the threshold required for the next poll's set
	const requiredXp = calculateSetThreshold(currentSet);

	// For display purposes, show if current XP would meet the threshold
	const meetsThreshold = isThresholdCheckPoll 
		? totalXp >= requiredXp 
		: true; // Not a threshold check poll, so would pass

	return {
		meetsThreshold,
		currentXp: totalXp,
		requiredXp,
		pollNumber,
		currentSet,
		pollInSet,
		isThresholdCheckPoll,
	};
};

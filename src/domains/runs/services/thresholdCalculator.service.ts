// TODO: Remove this as this is now dummy data for thresholds
export const XP_CALCULATION_CONSTANTS = {
	BASE_XP_MULTIPLIER: 5,
	WRONG_ANSWER_PENALTY: 2,
	BASE_POLL_XP: 5,
	XP_INCREMENT_PER_POLL: 2,
	POLLS_PER_SET: 3,
} as const;

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
 * Determines if current poll count requires a threshold check
 * @param pollsAnswered - Total polls answered in current run
 * @returns true if this is the 3rd poll in a set (threshold check required)
 */
export const shouldCheckThreshold = (pollsAnswered: number): boolean => {
	const { POLLS_PER_SET } = XP_CALCULATION_CONSTANTS;
	return pollsAnswered > 0 && pollsAnswered % POLLS_PER_SET === 0;
};

/**
 * Calculates XP threshold required for a completed set
 * Each set requires progressively more total XP
 * @param setNumber - Which set (1-based)
 * @returns Total XP required to pass the set threshold
 */

export const calculateSetThreshold = (setNumber: number): number => {
	const { BASE_POLL_XP, XP_INCREMENT_PER_POLL, POLLS_PER_SET } =
		XP_CALCULATION_CONSTANTS;
	const defaultThreshold = BASE_POLL_XP * POLLS_PER_SET;
	if (setNumber <= 0) return defaultThreshold;

	// Each set builds on previous difficulty
	// Set 1: Average BASE_POLL_XP per poll × POLLS_PER_SET = 15 XP total
	// Set 2: Average (BASE_POLL_XP + XP_INCREMENT_PER_POLL) per poll × POLLS_PER_SET = 21 XP total
	// Set 3: Average (BASE_POLL_XP + 2*XP_INCREMENT_PER_POLL) per poll × POLLS_PER_SET = 27 XP total
	const baseXpPerPoll =
		BASE_POLL_XP + (setNumber - 1) * XP_INCREMENT_PER_POLL;
	return baseXpPerPoll * POLLS_PER_SET;
};

/**
 * Core threshold calculation logic using 3-poll sets
 * @param totalXp - Total XP across all categories
 * @param totalPollsAnswered - Total polls answered across all categories
 * @returns Threshold information
 */

// TODO: refactor this function name as it is confusing
export const calculateThresholdInfo = (
	totalXp: number,
	totalPollsAnswered: number
): ThresholdInfo => {
	const currentSet = getCurrentRoundNumber(totalPollsAnswered);
	const pollInSet = getPollPositionInSet(totalPollsAnswered);
	const isThresholdCheckPoll = shouldCheckThreshold(totalPollsAnswered);

	// Always show the threshold required for the current set
	const requiredXp = calculateSetThreshold(currentSet);

	// Only enforce threshold check on 3rd poll of each set
	const meetsThreshold = isThresholdCheckPoll ? totalXp >= requiredXp : true; // Not a threshold check poll, so always passes

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
export const aggregateCategoryXpData = (
	categoryData: readonly CategoryXpData[]
) => {
	const totalXp = categoryData.reduce((sum, data) => sum + data.currentXp, 0);
	const totalPollsAnswered = categoryData.reduce(
		(sum, data) => sum + data.pollsAnswered,
		0
	);
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
	const { totalXp, totalPollsAnswered } =
		aggregateCategoryXpData(categoryXpData);

	// Poll number is the next poll (current + 1)
	const pollNumber = totalPollsAnswered + 1;
	const currentSet = getCurrentRoundNumber(pollNumber);
	const pollInSet = getPollPositionInSet(pollNumber);
	const isThresholdCheckPoll = shouldCheckThreshold(pollNumber);

	// Show the threshold required for the next poll's set
	const requiredXp = calculateSetThreshold(currentSet);

	// For display purposes, show if current XP would meet the threshold
	const meetsThreshold = isThresholdCheckPoll ? totalXp >= requiredXp : true; // Not a threshold check poll, so would pass

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

export const getCurrentThresholdInfo = (
	categoryXp: { currentXp: number; pollsAnswered: number }[]
): ThresholdInfo => {
	const categoryData = categoryXp.map((xp) => ({
		currentXp: xp.currentXp,
		pollsAnswered: xp.pollsAnswered,
	}));

	return calculateNextPollThresholdFromCategoryData(categoryData);
};

/**
 * Gets the current set number (1-based)
 * @param pollsAnswered - Total polls answered in current run
 * @returns Current set number (Set 1, Set 2, etc.)
 */
export const getCurrentRoundNumber = (pollsAnswered: number): number => {
	const { POLLS_PER_SET } = XP_CALCULATION_CONSTANTS;

	return Math.ceil(pollsAnswered / POLLS_PER_SET);
};

/**
 * Gets position within current 3-poll set (1, 2, or 3)
 * @param pollsAnswered - Total polls answered in current run
 * @returns Position in current set (1 = first poll, 2 = second poll, 3 = third poll)
 */
export const getPollPositionInSet = (pollsAnswered: number): number => {
	const { POLLS_PER_SET } = XP_CALCULATION_CONSTANTS;
	const position = pollsAnswered % POLLS_PER_SET;
	return position === 0 ? POLLS_PER_SET : position;
};

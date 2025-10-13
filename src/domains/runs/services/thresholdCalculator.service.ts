import type { RunCategoryXp } from "~/domains/runs/models/runCategoryXp";

/**
 * Coverage threshold system
 * Threshold increases by 10% each round (10%, 20%, 30%, etc.)
 * Players must achieve the threshold coverage in ONE category to continue
 */
const COVERAGE_PER_ROUND = 10; // 10% increase per round

/**
 * Threshold calculation result
 */
export type ThresholdInfo = {
	readonly meetsThreshold: boolean;
	readonly maxCoverage: number; // Highest coverage achieved in any category
	readonly requiredCoverage: number; // Threshold for current round
	readonly pollNumber: number;
	readonly currentRound: number;
};

/**
 * Calculates the required coverage threshold for a given round
 * @param round - Current round number (1-based)
 * @returns Required coverage percentage (10% per round)
 */
export const calculateRoundThreshold = (round: number): number => {
	return round * COVERAGE_PER_ROUND;
};

/**
 * Determines the current round based on total polls answered
 * @param totalPollsAnswered - Total polls answered across all categories
 * @returns Current round number (1-based)
 */
export const getCurrentRound = (totalPollsAnswered: number): number => {
	// Each poll advances the round (1 poll = round 1, 2 polls = round 2, etc.)
	return Math.max(1, totalPollsAnswered + 1);
};

/**
 * Core threshold calculation logic
 * Checks if any category has reached the required coverage threshold
 *
 * @param categoryXpData - Array of category coverage data
 * @returns Threshold information
 */
export const calculateThresholdInfo = (
	categoryXpData: readonly RunCategoryXp[]
): ThresholdInfo => {
	// Find the maximum coverage across all categories
	const maxCoverage = Math.max(
		...categoryXpData.map((xp) => xp.currentCoverage),
		0 // Default to 0 if no categories
	);

	// Calculate total polls answered
	const totalPollsAnswered = categoryXpData.reduce(
		(sum, xp) => sum + xp.pollsAnswered,
		0
	);

	// Determine current round and required coverage
	const currentRound = getCurrentRound(totalPollsAnswered);
	const requiredCoverage = calculateRoundThreshold(currentRound);

	// Threshold is met if ANY category has reached the required coverage
	const meetsThreshold = maxCoverage >= requiredCoverage;

	return {
		meetsThreshold,
		maxCoverage,
		requiredCoverage,
		pollNumber: totalPollsAnswered,
		currentRound,
	};
};

/**
 * Get current threshold status from category data
 * @param categoryXp - Array of category coverage data
 * @returns Threshold information
 */
export const getCurrentThresholdInfo = (
	categoryXp: readonly RunCategoryXp[]
): ThresholdInfo => {
	return calculateThresholdInfo(categoryXp);
};

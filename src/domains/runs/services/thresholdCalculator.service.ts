import type { RunCategoryXp } from "~/domains/runs/models/runCategoryXp";

/**
 * Coverage threshold system
 * Threshold increases by 10% each round (10%, 20%, 30%, etc.)
 * Players must achieve the threshold coverage in ONE category to continue
 */
const COVERAGE_PER_ROUND = 2; // 10% increase per round

/**
 * Threshold calculation result
 */
export type ThresholdInfo = {
	readonly meetsThreshold: boolean;
	readonly maxCoverage: number; // Highest coverage achieved in any category
	readonly requiredCoverage: number; // Threshold for current round
	readonly pollNumber: number;
	readonly currentRound: number;
	readonly pollInRound: number; // Position within the current round (1, 2, or 3)
	readonly isThresholdCheckPoll: boolean; // True for every 3rd poll (polls 3, 6, 9, etc.)
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
 * Rounds are organized in sets of 3 polls:
 * - Round 1 (Polls 0-3): 10% threshold at poll 3
 * - Round 2 (Polls 4-6): 20% threshold at poll 6
 * - Round 3 (Polls 7-9): 30% threshold at poll 9
 *
 * The game starts at Round 1 before any polls are answered.
 *
 * Formula: Math.floor((totalPollsAnswered - 1) / 3) + 1
 *
 * Examples:
 * - Poll 0: Round 1 (starting state, goal is 10%)
 * - Poll 1: floor((1-1)/3) + 1 = floor(0) + 1 = 1 → Round 1
 * - Poll 2: floor((2-1)/3) + 1 = floor(0.33) + 1 = 1 → Round 1
 * - Poll 3: floor((3-1)/3) + 1 = floor(0.66) + 1 = 1 → Round 1 (threshold check)
 * - Poll 4: floor((4-1)/3) + 1 = floor(1) + 1 = 2 → Round 2
 * - Poll 5: floor((5-1)/3) + 1 = floor(1.33) + 1 = 2 → Round 2
 * - Poll 6: floor((6-1)/3) + 1 = floor(1.66) + 1 = 2 → Round 2 (threshold check)
 *
 * @param totalPollsAnswered - Total polls answered across all categories
 * @returns Current round number (1-based, minimum 1)
 */
export const getCurrentRound = (totalPollsAnswered: number): number => {
	if (totalPollsAnswered === 0) return 1; // Game starts at Round 1
	return Math.floor((totalPollsAnswered - 1) / 3) + 1;
};

/**
 * Determines the position within the current round (1, 2, or 3)
 *
 * Formula: ((totalPollsAnswered - 1) % 3) + 1
 *
 * Examples:
 * - Poll 1: ((1-1) % 3) + 1 = (0 % 3) + 1 = 1 → Poll 1 of round
 * - Poll 2: ((2-1) % 3) + 1 = (1 % 3) + 1 = 2 → Poll 2 of round
 * - Poll 3: ((3-1) % 3) + 1 = (2 % 3) + 1 = 3 → Poll 3 of round (threshold check)
 * - Poll 4: ((4-1) % 3) + 1 = (3 % 3) + 1 = 1 → Poll 1 of round
 *
 * @param totalPollsAnswered - Total polls answered across all categories
 * @returns Poll position within round (1-3)
 */
export const getPollInRound = (totalPollsAnswered: number): number => {
	if (totalPollsAnswered === 0) return 3; // Default to 3 for no polls
	return ((totalPollsAnswered - 1) % 3) + 1;
};

/**
 * Checks if the current poll is a threshold check poll (every 3rd poll)
 *
 * Threshold checks happen at polls 3, 6, 9, 12, etc.
 * Formula: totalPollsAnswered % 3 === 0
 *
 * @param totalPollsAnswered - Total polls answered across all categories
 * @returns True if this is a threshold check poll (polls 3, 6, 9, etc.)
 */
export const isThresholdCheckPoll = (totalPollsAnswered: number): boolean => {
	return totalPollsAnswered > 0 && totalPollsAnswered % 3 === 0;
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
	const pollInRound = getPollInRound(totalPollsAnswered);
	const isThresholdCheck = isThresholdCheckPoll(totalPollsAnswered);

	// Threshold is met if ANY category has reached the required coverage
	// OR if this is not a threshold check poll (polls 1, 2, 4, 5, etc. always pass)
	const meetsThreshold = !isThresholdCheck || maxCoverage >= requiredCoverage;

	return {
		meetsThreshold,
		maxCoverage,
		requiredCoverage,
		pollNumber: totalPollsAnswered,
		currentRound,
		pollInRound,
		isThresholdCheckPoll: isThresholdCheck,
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

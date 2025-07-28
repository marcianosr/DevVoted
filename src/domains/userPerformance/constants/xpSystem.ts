// XP System Constants

export const DEFAULT_XP_AWARD = 5;

export const XP_AWARDS = {
	CORRECT_ANSWER: DEFAULT_XP_AWARD,
} as const;

// Multiple Choice XP Formula: XP = 5 * (N_correct / N_total) - 2 * N_wrong
export const calculateMultipleChoiceXP = (
	nCorrect: number,
	nTotal: number,
	nWrong: number
): number => {
	if (nTotal === 0) return 0;

	const xp = 5 * (nCorrect / nTotal) - 2 * nWrong;
	return Math.max(0, Math.round(xp)); // Round to nearest integer
};

// XP Threshold System: Progressive XP requirements per poll
// Simplified formula: 5 XP for first poll, then +2 XP per streak
// Poll 1: 5 XP, Poll 2: 7 XP, Poll 3: 9 XP, Poll 4: 11 XP
export const calculateXpThreshold = (pollNumber: number): number => {
	if (pollNumber <= 0) return 5;
	
	// Formula: 5 + (pollNumber - 1) * 2
	// This gives: 5, 7, 9, 11, 13, 15, 17, 19, 21, ...
	return 5 + (pollNumber - 1) * 2;
};

// === 3-POLL SET SYSTEM ===
// Instead of checking threshold every poll, check every 3rd poll
// Players accumulate XP across 3-poll sets and must meet threshold at the end

/**
 * Determines if current poll count requires a threshold check
 * @param pollsAnswered - Total polls answered in current run
 * @returns true if this is the 3rd poll in a set (threshold check required)
 */
export const shouldCheckThreshold = (pollsAnswered: number): boolean => {
	return pollsAnswered > 0 && pollsAnswered % 3 === 0;
};

/**
 * Gets the current set number (1-based)
 * @param pollsAnswered - Total polls answered in current run
 * @returns Current set number (Set 1, Set 2, etc.)
 */
export const getCurrentSetNumber = (pollsAnswered: number): number => {
	return Math.ceil(pollsAnswered / 3);
};

/**
 * Gets position within current 3-poll set (1, 2, or 3)
 * @param pollsAnswered - Total polls answered in current run
 * @returns Position in current set (1 = first poll, 2 = second poll, 3 = third poll)
 */
export const getPollPositionInSet = (pollsAnswered: number): number => {
	const position = pollsAnswered % 3;
	return position === 0 ? 3 : position; // Convert 0 to 3 for readability
};

/**
 * Calculates XP threshold required for a completed set
 * Each set requires progressively more total XP
 * @param setNumber - Which set (1-based)
 * @returns Total XP required to pass the set threshold
 */
export const calculateSetThreshold = (setNumber: number): number => {
	if (setNumber <= 0) return 15; // Default for invalid input
	
	// Each set builds on previous difficulty
	// Set 1: Average 5 XP per poll × 3 = 15 XP total
	// Set 2: Average 7 XP per poll × 3 = 21 XP total  
	// Set 3: Average 9 XP per poll × 3 = 27 XP total
	const baseXpPerPoll = 5 + (setNumber - 1) * 2;
	return baseXpPerPoll * 3;
};

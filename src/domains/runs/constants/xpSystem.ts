// XP System Constants

export const DEFAULT_XP_AWARD = 5;

// Magic number constants for XP calculations
export const XP_CALCULATION_CONSTANTS = {
	BASE_XP_MULTIPLIER: 5,
	WRONG_ANSWER_PENALTY: 2,
	BASE_POLL_XP: 5,
	XP_INCREMENT_PER_POLL: 2,
	POLLS_PER_SET: 3,
} as const;

export const XP_AWARDS = {
	CORRECT_ANSWER: DEFAULT_XP_AWARD,
} as const;

// Multiple Choice XP Formula: XP = BASE_XP_MULTIPLIER * (N_correct / N_total) - WRONG_ANSWER_PENALTY * N_wrong
export const calculateMultipleChoiceXP = (
	nCorrect: number,
	nTotal: number,
	nWrong: number
): number => {
	if (nTotal === 0) return 0;

	const { BASE_XP_MULTIPLIER, WRONG_ANSWER_PENALTY } =
		XP_CALCULATION_CONSTANTS;
	const xp =
		BASE_XP_MULTIPLIER * (nCorrect / nTotal) -
		WRONG_ANSWER_PENALTY * nWrong;
	return Math.max(0, Math.round(xp));
};

// XP Threshold System: Progressive XP requirements per poll
// Simplified formula: BASE_POLL_XP for first poll, then +XP_INCREMENT_PER_POLL per streak
// Poll 1: 5 XP, Poll 2: 7 XP, Poll 3: 9 XP, Poll 4: 11 XP
export const calculateXpThreshold = (pollNumber: number): number => {
	const { BASE_POLL_XP, XP_INCREMENT_PER_POLL } = XP_CALCULATION_CONSTANTS;
	if (pollNumber <= 0) return BASE_POLL_XP;

	// Formula: BASE_POLL_XP + (pollNumber - 1) * XP_INCREMENT_PER_POLL
	// This gives: 5, 7, 9, 11, 13, 15, 17, 19, 21, ...
	return BASE_POLL_XP + (pollNumber - 1) * XP_INCREMENT_PER_POLL;
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
	const { POLLS_PER_SET } = XP_CALCULATION_CONSTANTS;
	return pollsAnswered > 0 && pollsAnswered % POLLS_PER_SET === 0;
};

/**
 * Gets the current set number (1-based)
 * @param pollsAnswered - Total polls answered in current run
 * @returns Current set number (Set 1, Set 2, etc.)
 */
export const getCurrentSetNumber = (pollsAnswered: number): number => {
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

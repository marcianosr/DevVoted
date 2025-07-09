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
	return Math.max(0, Math.round(xp * 100) / 100); // Round to 2 decimal places
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

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

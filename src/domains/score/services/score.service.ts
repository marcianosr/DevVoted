import { getCurrentRoundNumber } from "~/domains/runs/services/thresholdCalculator.service";

export const getRoundXP = (round: number) => round * 10;
// +10% per correct-in-a-row, capped at +80%
export const getStreakAmp = (streak: number) => Math.min(1 + 0.1 * streak, 1.8);

export type PollAnswerOutcome = "full" | "partial" | "wrong";

export const outcomeSingle = (isCorrect: boolean): PollAnswerOutcome =>
	isCorrect ? "full" : "wrong";

export const outcomeMulti = (
	nCorrectPicked: number,
	nCorrectTotal: number,
	nWrongPicked: number
): PollAnswerOutcome => {
	if (nCorrectPicked === 0) return "wrong";
	if (nCorrectPicked === nCorrectTotal && nWrongPicked === 0) return "full";
	return "partial";
};

export const singleCorrectnessFactor = (isCorrect: boolean) => {
	return isCorrect ? 1.0 : 0.0;
};

export const multiCorrectnessFactor = (
	nCorrectPicked: number,
	nCorrectTotal: number,
	nWrongPicked: number
) => {
	// No correct answers picked = 0 points
	if (nCorrectPicked === 0) return 0.0;
	
	// Calculate base score from correct answers
	const correctRatio = nCorrectPicked / Math.max(1, nCorrectTotal);
	
	// Penalize wrong answers, but don't go below 0
	const wrongPenalty = nWrongPicked * 0.25; // 25% penalty per wrong answer
	const adjustedScore = Math.max(0, correctRatio - wrongPenalty);
	
	// Scale to 0.5-1.0 range if there's any score left
	return adjustedScore > 0 ? 0.5 + 0.5 * adjustedScore : 0.0;
};

export const calculateXP = (
	correctnessFactor: number,
	baseXP: number
): number => {
	return Math.round(baseXP * correctnessFactor);
};

export const calculateStreakUpdate = (
	currentStreak: number,
	earnedXP: number
): number => {
	return earnedXP > 0 ? currentStreak + 1 : currentStreak;
};

export const calculateBestStreak = (
	currentBestStreak: number,
	newStreak: number
): number => {
	return Math.max(currentBestStreak, newStreak);
};

export const calculateRunXP = (
	pollsAnswered: number,
	currentStreak: number
): number => {
	const newRound = getCurrentRoundNumber(pollsAnswered);
	const base = getRoundXP(newRound);
	const amp = getStreakAmp(currentStreak);

	return Math.round(base * amp);
};

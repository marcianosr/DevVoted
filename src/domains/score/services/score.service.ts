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

	const totalPicked = nCorrectPicked + nWrongPicked;
	const correctRatio = nCorrectPicked / nCorrectTotal;
	const isPerfect = nCorrectPicked === nCorrectTotal && nWrongPicked === 0;
	const isComplete = nCorrectPicked === nCorrectTotal;

	// Anti-spam: picking too many options (more than 2x correct answers)
	if (totalPicked > nCorrectTotal * 2) {
		return isPerfect ? 0.5 : 0.0;
	}

	// Perfect answer: all correct, no wrong = 1.5x bonus
	if (isPerfect) return 1.5;

	// Complete but messy: all correct answers found, but with wrong picks = 1.0
	if (isComplete && nWrongPicked > 0) return 1.0;

	// Clean partial: some correct, no wrong = full ratio reward
	if (nWrongPicked === 0) return 1.0;

	// Messy partial: some correct with wrong picks
	// Penalty increases with wrong picks: -0.25 per wrong answer
	const penalty = nWrongPicked * 0.25;
	const adjustedScore = Math.max(0.5, correctRatio - penalty);

	return Math.min(adjustedScore, 1.0); // Cap at 1.0 for messy partials
};

export const calculateXP = (
	correctnessFactor: number,
	baseXP: number
): number => {
	return Math.round(baseXP * correctnessFactor);
};

export const calculateStreakUpdate = (
	currentStreak: number,
	correctnessFactor: number
): number => {
	return correctnessFactor > 0 ? currentStreak + 1 : 0; // Reset to 0 on wrong answer
};

export const calculateBestStreak = (
	currentBestStreak: number,
	newStreak: number
): number => {
	return Math.max(currentBestStreak, newStreak);
};

export type PollScoreBreakdown = {
	round: number;
	streak: number;
	base: number;
	amp: number;
	earnedXP: number;
	delta: number;
};

export const calculatePollScoreForProgression = (
	pollsAnswered: number,
	streak: number,
	configAmpBonus: number = 0
): PollScoreBreakdown => {
	const round = getCurrentRoundNumber(pollsAnswered);
	const base = getRoundXP(round);
	const amp = getStreakAmp(streak) + configAmpBonus; // Add config bonus to amp
	const earnedXP = Math.round(base * amp);
	const delta = earnedXP;

	return {
		round,
		streak,
		base,
		amp,
		earnedXP,
		delta,
	};
};

export type ScoreCalculation = {
	newTotalXP: number;
	newBestStreak: number;
	newStreak: number;
	newPollsAnswered: number;
	breakdown: PollScoreBreakdown;
};

export const orchestrateScoreCalculation = (
	currentXP: number,
	currentStreak: number,
	currentBestStreak: number,
	totalPollsAnswered: number,
	correctnessFactor: number,
	configAmpBonus: number = 0
): ScoreCalculation => {
	const newStreak = calculateStreakUpdate(
		currentStreak,
		correctnessFactor
	);
	const newBestStreak = calculateBestStreak(currentBestStreak, newStreak);
	const newPollsAnswered = totalPollsAnswered + 1;

	const { base, amp, round, streak, earnedXP } =
		calculatePollScoreForProgression(newPollsAnswered, newStreak, configAmpBonus);

	// Apply correctness factor multiplier to earned XP
	const actualEarnedXP = Math.round(earnedXP * correctnessFactor);
	const newTotalXP = currentXP + actualEarnedXP;

	return {
		newTotalXP,
		newBestStreak,
		newStreak,
		newPollsAnswered,
		breakdown: {
			round,
			streak,
			base,
			amp,
			earnedXP: actualEarnedXP,
			delta: actualEarnedXP,
		},
	};
};

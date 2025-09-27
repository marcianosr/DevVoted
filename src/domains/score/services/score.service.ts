import { getCurrentRoundNumber } from "~/domains/runs/services/thresholdCalculator.service";

const CAP_MULT = 1000;
export const getRoundXP = (round: number) => round * 10;
// +10% per correct-in-a-row, capped at +80%
export const getStreakAmp = (streak: number) =>
	Math.min(1 + 0.1 * streak, CAP_MULT);

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

/**
 * Calculates the score breakdown for a poll answer.
 *
 * Score Pipeline:
 * 1. Base XP = round * 10 (e.g., round 2 = 20 XP)
 * 2. Base Amp = 1 + (0.1 * streak), capped at 3.0 (e.g., streak 1 = 1.1x)
 * 3. Config modifiers applied: amp = baseAmp * configAmpMul + configAmpAdd
 * 4. Raw XP = base * amp (e.g., 20 * 1.4 = 28)
 * 5. Final XP = rawXP + configXpAdd
 *
 * Note: This calculates pre-correctness XP. The correctness factor (0-1.5x)
 * is applied later in orchestrateScoreCalculation.
 *
 * @example
 * // Round 2, streak 1, with +0.3 amp from configs
 * calculatePollScoreForProgression(5, 1, 1, 0.3, 0)
 * // Returns: { base: 20, amp: 1.4, earnedXP: 28, ... }
 */
export const calculatePollScoreForProgression = (
	pollsAnswered: number,
	streak: number,
	configAmpMul: number = 1,
	configAmpAdd: number = 0,
	configXpAdd: number = 0
): PollScoreBreakdown => {
	// Step 1: Determine round and base XP (e.g., round 2 = 20 XP)
	const round = getCurrentRoundNumber(pollsAnswered);
	const base = getRoundXP(round);

	// Step 2: Calculate streak amp (e.g., streak 1 = 1.1x)
	const baseAmp = getStreakAmp(streak);

	// Step 3: Apply config modifiers (multiplicative first, then additive)
	const rawAmp = baseAmp * configAmpMul + configAmpAdd;
	// Round to 1 decimal to avoid floating-point issues (1.0999... → 1.1)
	const amp = Math.max(0, Math.round(rawAmp * 10) / 10);

	// Step 4: Calculate XP (base * amp + flat bonus)
	const rawXP = Math.round(base * amp);
	const earnedXP = Math.max(0, rawXP + configXpAdd);
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

type OrchestrateScoreCalculationParams = {
	currentXP: number;
	currentStreak: number;
	currentBestStreak: number;
	totalPollsAnswered: number;
	correctnessFactor: number;
	configAmpMul?: number;
	configAmpAdd?: number;
	configXpAdd?: number;
};

/**
 * Orchestrates the complete score calculation including streak updates and correctness.
 *
 * Complete Score Pipeline:
 * 1. Update streak based on correctness (correct = +1, wrong = reset to 0)
 * 2. Calculate base score via calculatePollScoreForProgression
 * 3. Apply correctness factor multiplier:
 *    - Wrong answer: 0x
 *    - Partial multi-choice: 0.5-1.0x
 *    - Perfect single/multi: 1.0x
 *    - Perfect multi-choice: 1.5x bonus
 * 4. Add to running total XP
 *
 * @example
 * // Perfect multi-choice answer with configs
 * orchestrateScoreCalculation({
 *   currentXP: 100,
 *   currentStreak: 0,
 *   totalPollsAnswered: 4,
 *   correctnessFactor: 1.5,  // Perfect multi-choice
 *   configAmpAdd: 0.3        // From active configs
 * })
 * // Returns: { newTotalXP: 142, breakdown: { earnedXP: 42, ... } }
 */
export const orchestrateScoreCalculation = ({
	currentXP,
	currentStreak,
	currentBestStreak,
	totalPollsAnswered,
	correctnessFactor,
	configAmpAdd,
	configAmpMul,
	configXpAdd,
}: OrchestrateScoreCalculationParams): ScoreCalculation => {
	// Step 1: Update streak (continues on correct, resets on wrong)
	const newStreak = calculateStreakUpdate(currentStreak, correctnessFactor);
	const newBestStreak = calculateBestStreak(currentBestStreak, newStreak);
	const newPollsAnswered = totalPollsAnswered + 1;

	// Step 2: Calculate base score with config modifiers
	const { base, amp, round, streak, earnedXP } =
		calculatePollScoreForProgression(
			newPollsAnswered,
			newStreak,
			configAmpMul,
			configAmpAdd,
			configXpAdd
		);

	// Step 3: Apply correctness multiplier (0-1.5x based on answer quality)
	// Example: earnedXP=28 * correctness=1.5 (perfect multi) = 42 XP
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

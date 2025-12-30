/**
 * Coverage-based scoring with round scaling and streak bonuses
 * Base formula: (1% + round × 0.2%) + (streak × 0.1%, capped at 1%)
 */
const BASE_COVERAGE = 1; // Starting coverage per correct answer
const ROUND_SCALING = 0.2; // Additional coverage per round
const STREAK_BONUS = 0.1; // Bonus per streak point
const MAX_STREAK_BONUS = 1.0; // Cap streak bonus at 1%
const WRONG_ANSWER_PENALTY = -0.5; // Penalty for wrong answers
const MAX_COVERAGE = 100; // Maximum coverage percentage

/**
 * Calculates base coverage with round scaling
 * Formula: 1% + (round × 0.2%)
 * @param round - Current round number (1-based)
 * @returns Base coverage percentage
 * @example
 * calculateBaseCoverage(1) // 1.2%
 * calculateBaseCoverage(5) // 2.0%
 * calculateBaseCoverage(10) // 3.0%
 */
export const calculateBaseCoverage = (round: number): number => {
	return BASE_COVERAGE + round * ROUND_SCALING;
};

/**
 * Calculates streak bonus (capped at 1%)
 * Formula: min(streak × 0.1%, 1.0%)
 * @param streak - Current streak count
 * @returns Streak bonus percentage
 * @example
 * calculateStreakBonus(0) // 0%
 * calculateStreakBonus(5) // 0.5%
 * calculateStreakBonus(15) // 1.0% (capped)
 */
export const calculateStreakBonus = (streak: number): number => {
	return (
		Math.round(Math.min(streak * STREAK_BONUS, MAX_STREAK_BONUS) * 10) / 10
	);
};

/**
 * Formats a coverage percentage to 1 decimal place
 * @param coverage - The coverage value (0-100)
 * @returns Formatted string with 1 decimal place (e.g., "25.8")
 */
export const formatCoverage = (coverage: number): string => {
	return coverage.toFixed(1);
};

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

type CalculateCoverageParams = {
	correctnessFactor: number;
	round: number;
	streak: number;
};

/**
 * Calculates coverage earned based on correctness factor, round, and streak
 * Formula: (baseCoverage + streakBonus) × correctnessFactor
 * Or WRONG_ANSWER_PENALTY if incorrect
 * @param params - Coverage calculation parameters
 * @param params.correctnessFactor - 0-1.5 based on answer quality
 * @param params.round - Current round number
 * @param params.streak - Current streak count
 * @returns Coverage percentage earned (can be negative for wrong answers)
 */
export const calculateCoverage = ({
	correctnessFactor,
	round,
	streak,
}: CalculateCoverageParams): number => {
	// Wrong answer gets penalty
	if (correctnessFactor === 0) {
		return WRONG_ANSWER_PENALTY * (1 + round * 2); // Penalty scales with round
	}

	// Correct answer: base + streak bonus, multiplied by correctness
	const baseCoverage = calculateBaseCoverage(round);
	const streakBonus = calculateStreakBonus(streak);
	return (baseCoverage + streakBonus) * correctnessFactor;
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
	streak: number;
	earnedCoverage: number;
	delta: number;
	baseCoverage: number; // Base coverage from round (before bonuses)
	streakBonus: number; // Bonus from streak
	configBonus: number; // Bonus from configs (additive + multiplicative effects)
};

/**
 * Calculates the score breakdown for a poll answer.
 *
 * Coverage Pipeline:
 * 1. Base coverage = 1% + (round × 0.2%)
 * 2. Streak bonus = streak × 0.1% (capped at 1%)
 * 3. Combined and applied with correctness factor
 *
 * @param round - Current round number
 * @param streak - Current streak count
 * @returns Score breakdown with base coverage before correctness
 */
export const calculatePollScoreForProgression = (
	round: number,
	streak: number
): PollScoreBreakdown => {
	// Calculate base coverage with round scaling and streak bonus
	const baseCoverage = calculateBaseCoverage(round);
	const streakBonus = calculateStreakBonus(streak);
	const earnedCoverage = baseCoverage + streakBonus;

	return {
		streak,
		earnedCoverage,
		delta: earnedCoverage,
		baseCoverage,
		streakBonus,
		configBonus: 0, // No config bonus for progression calculation
	};
};

export type ScoreCalculation = {
	newTotalCoverage: number;
	newBestStreak: number;
	newStreak: number;
	newPollsAnswered: number;
	breakdown: PollScoreBreakdown;
};

type OrchestrateScoreCalculationParams = {
	currentCoverage: number;
	currentStreak: number;
	currentBestStreak: number;
	totalPollsAnswered: number;
	totalPollsSeen: number;
	correctnessFactor: number;
	pollsPerGate: number; // Number of polls per gate (from challenge mode)
	coverageAdd?: number; // Additive coverage bonus from configs (e.g., +0.5%)
	coverageMult?: number; // Multiplicative coverage modifier from configs (e.g., x1.5)
};

/**
 * Orchestrates the complete score calculation including streak updates and correctness.
 *
 * Complete Coverage Pipeline:
 * 1. Update streak based on correctness (correct = +1, wrong = reset to 0)
 * 2. Calculate current round from polls SEEN (not answered)
 * 3. Calculate base coverage with round scaling: 1% + (round × 0.2%)
 * 4. Add streak bonus (capped at 1%): streak × 0.1%
 * 5. Apply correctness factor:
 *    - Wrong answer: -0.5% (penalty)
 *    - Partial multi-choice: (base+streak) × 0.5-1.0
 *    - Perfect single/multi: (base+streak) × 1.0
 *    - Perfect multi-choice: (base+streak) × 1.5
 * 6. Apply config multiplicative modifier (if present): result × coverageMult
 * 7. Apply config additive modifier (if present): result + coverageAdd
 * 8. Round and add to total coverage
 *
 * @example
 * // Round 5 (24 polls seen), streak 5, perfect answer with .js config
 * orchestrateScoreCalculation({
 *   currentCoverage: 10,
 *   currentStreak: 4,
 *   totalPollsAnswered: 20,
 *   totalPollsSeen: 24,
 *   correctnessFactor: 1.0,
 *   coverageAdd: 0.5,
 * })
 * // Round 5: base = 2%, streak = 0.5%, total = 2.5%
 * // + config 0.5% = 3%, rounds to 3%
 */
export const orchestrateScoreCalculation = ({
	currentCoverage,
	currentStreak,
	currentBestStreak,
	totalPollsAnswered,
	totalPollsSeen,
	correctnessFactor,
	pollsPerGate,
	coverageAdd = 0,
	coverageMult = 1,
}: OrchestrateScoreCalculationParams): ScoreCalculation => {
	// Step 1: Update streak (continues on correct, resets on wrong)
	const newStreak = calculateStreakUpdate(currentStreak, correctnessFactor);
	const newBestStreak = calculateBestStreak(currentBestStreak, newStreak);
	const newPollsAnswered = totalPollsAnswered + 1;

	// Calculate current round from polls seen (rounds are 1-based)
	const currentGate = Math.floor(totalPollsSeen / pollsPerGate) + 1;

	// Step 2-4: Calculate coverage with round scaling, streak bonus, and correctness
	const baseCoverage = calculateBaseCoverage(currentGate);
	const streakBonus = calculateStreakBonus(newStreak);
	const coverageBeforeConfigs = calculateCoverage({
		correctnessFactor,
		round: currentGate,
		streak: newStreak,
	});

	// Step 5: Apply config multiplicative modifier (e.g., x1.5 from config)
	const coverageWithMul = coverageBeforeConfigs * coverageMult;

	// Step 6: Apply config additive modifier (e.g., +0.5% from .js config, or -0.3% from Math.random)
	const coverageWithAdd = coverageWithMul + coverageAdd;

	// Calculate config bonus (difference between final coverage and coverage before configs)
	const configBonus = coverageWithAdd - coverageBeforeConfigs;

	// Step 7: Round to 1 decimal place to avoid floating point precision issues
	const actualEarnedCoverage = Math.round(coverageWithAdd * 10) / 10;
	const newTotalCoverage = Math.min(
		MAX_COVERAGE,
		Math.round((currentCoverage + actualEarnedCoverage) * 10) / 10
	);

	const round = (n: number) => Math.round(n * 10) / 10;

	return {
		newTotalCoverage,
		newBestStreak,
		newStreak,
		newPollsAnswered,
		breakdown: {
			streak: newStreak,
			earnedCoverage: actualEarnedCoverage,
			delta: actualEarnedCoverage,
			baseCoverage: round(baseCoverage * correctnessFactor),
			streakBonus: round(streakBonus * correctnessFactor),
			configBonus: round(configBonus),
		},
	};
};

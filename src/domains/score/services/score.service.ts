/**
 * Coverage-based scoring: 1% per correct poll answer
 * Simplified from the previous XP/amp system
 */
const COVERAGE_PER_CORRECT = 1; // 1% coverage per fully correct answer

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

/**
 * Calculates coverage earned based on correctness factor
 * @param correctnessFactor - 0-1.5 based on answer quality
 * @returns Coverage percentage earned (0-1.5%)
 */
export const calculateCoverage = (correctnessFactor: number): number => {
	return Math.round(COVERAGE_PER_CORRECT * correctnessFactor);
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
};

/**
 * Calculates the score breakdown for a poll answer.
 *
 * Coverage Pipeline (Simplified):
 * 1. Base coverage = 1% per correct answer
 * 2. Correctness factor applied (0-1.5x based on answer quality)
 *
 * Note: Streaks are tracked for display/stats but don't affect scoring
 *
 * @param streak - Current streak count (for display only)
 * @returns Score breakdown with earned coverage
 */
export const calculatePollScoreForProgression = (
	streak: number
): PollScoreBreakdown => {
	// In coverage system, base is always 1% before correctness factor
	const earnedCoverage = COVERAGE_PER_CORRECT;

	return {
		streak,
		earnedCoverage,
		delta: earnedCoverage,
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
	correctnessFactor: number;
	coverageAdd?: number; // Additive coverage bonus from configs (e.g., +0.5%)
	coverageMul?: number; // Multiplicative coverage modifier from configs (e.g., x1.5)
};

/**
 * Orchestrates the complete score calculation including streak updates and correctness.
 *
 * Complete Coverage Pipeline:
 * 1. Update streak based on correctness (correct = +1, wrong = reset to 0)
 * 2. Calculate base coverage (1%)
 * 3. Apply correctness factor multiplier:
 *    - Wrong answer: 0x (0% coverage)
 *    - Partial multi-choice: 0.5-1.0x (0.5-1% coverage)
 *    - Perfect single/multi: 1.0x (1% coverage)
 *    - Perfect multi-choice: 1.5x (1.5% coverage bonus)
 * 4. Apply config multiplicative modifier (if present): result * coverageMul
 * 5. Apply config additive modifier (if present): result + coverageAdd
 * 6. Add to running total coverage
 *
 * @example
 * // Perfect multi-choice answer with .js config (+0.5% coverage)
 * orchestrateScoreCalculation({
 *   currentCoverage: 10,
 *   currentStreak: 0,
 *   totalPollsAnswered: 4,
 *   correctnessFactor: 1.5,  // Perfect multi-choice
 *   coverageAdd: 0.5,        // .js config bonus
 * })
 * // Returns: { newTotalCoverage: 12, breakdown: { earnedCoverage: 2, ... } }
 * // (1% base * 1.5 correctness = 1.5%, rounds to 2%, + 0.5% config = 2.5%, rounds to 3%)
 */
export const orchestrateScoreCalculation = ({
	currentCoverage,
	currentStreak,
	currentBestStreak,
	totalPollsAnswered,
	correctnessFactor,
	coverageAdd = 0,
	coverageMul = 1,
}: OrchestrateScoreCalculationParams): ScoreCalculation => {
	// Step 1: Update streak (continues on correct, resets on wrong)
	const newStreak = calculateStreakUpdate(currentStreak, correctnessFactor);
	const newBestStreak = calculateBestStreak(currentBestStreak, newStreak);
	const newPollsAnswered = totalPollsAnswered + 1;

	// Step 2: Calculate base coverage
	const { streak, earnedCoverage } =
		calculatePollScoreForProgression(newStreak);

	// Step 3: Apply correctness multiplier (0-1.5x based on answer quality)
	// Example: earnedCoverage=1 * correctness=1.5 (perfect multi) = 1.5% coverage
	let coverageWithCorrectness = earnedCoverage * correctnessFactor;

	// Step 4: Apply config multiplicative modifier (e.g., x1.5 from config)
	let coverageWithMul = coverageWithCorrectness * coverageMul;

	// Step 5: Apply config additive modifier (e.g., +0.5% from .js config, or -0.3% from Math.random)
	let coverageWithAdd = coverageWithMul + coverageAdd;

	// Step 6: Round and add to total (avoid decimals)
	const actualEarnedCoverage = Math.round(coverageWithAdd);
	const newTotalCoverage = currentCoverage + actualEarnedCoverage;

	return {
		newTotalCoverage,
		newBestStreak,
		newStreak,
		newPollsAnswered,
		breakdown: {
			streak,
			earnedCoverage: actualEarnedCoverage,
			delta: actualEarnedCoverage,
		},
	};
};

export const SLICE_WINDOW = 5;
/**
 * The summit's gate number. Gates count from **0**: gate 0 runs on the starting
 * pipeline, and every gate after it is bought with a slot (ADR-018), so this is
 * the far end of the slot ladder: `MAX_SLOTS - BASE_SLOTS`. Gate 11 needs all 14
 * slots, which means every swatch.
 */
export const VICTORY_GATE = 11;

/** How many gates a run holds — gates 0 through `VICTORY_GATE`. */
export const GATE_COUNT = VICTORY_GATE + 1;
/** Gate-1 base storage (KB) a clear pays — scaled by gate depth, reward multipliers, and window correctness. */
export const GATE_REWARD_KB = 32;
/** Depth cap on the reward's gate multiplier: endless (continue-past-victory) runs stop scaling payout past gate 12, the intended summit. */
export const GATE_REWARD_MULTIPLIER_CAP = 12;
/** Hard cap (KB) on the storage currency — income beyond this is discarded. */
export const STORAGE_CAP_KB = 512;
/**
 * Per-run ceiling (KB) on per-correct faucet income (IndexedDB). A single
 * run-wide counter, deliberately: the shipped roster carries exactly one faucet
 * config. If a second faucet ever ships, split the counter per config id.
 */
export const FAUCET_CAP_KB = 320;
/**
 * Share of leftover storage credited to archived_storage when a run ends —
 * proportional to how far the climb got (Marciano, 2026-07-19; supersedes
 * the flat rates of DVTD-li9i): winning the final gate banks everything,
 * dying at the halfway gate banks half, walking away banks nothing so
 * abandoning can never be a cash-out.
 */
export const storageCreditRate = (
	reason: "victory" | "dead" | "abandoned",
	gatesCleared: number
): number => {
	if (reason === "abandoned") return 0;
	if (reason === "victory") return 1;
	// gatesCleared is a count, so it divides by the count, not the last number.
	return Math.min(1, gatesCleared / GATE_COUNT);
};

export const WRONG_COVERAGE_LOSS = 0.5;

export const STREAK_COVERAGE_BONUS = 0.1;

export const streakMultiplier = (streak: number): number =>
	1 + STREAK_COVERAGE_BONUS * streak;

/**
 * Deeper gates are worth more: the base coverage a correct answer earns scales
 * with depth, so the first gate pays ×1, the next ×2, and so on. `gatesCleared`
 * counts gates already beaten; since gates count from 0 it is also the number of
 * the gate being answered.
 * Only gains scale — losses stay flat.
 */
export const gateBaseMultiplier = (gatesCleared: number): number =>
	gatesCleared + 1;

export const OPTION_COVERAGE_STEP = 0.1;
export const MULTIPLE_CHOICE_COVERAGE_BONUS = 0.5;
/** Fewest options a poll can carry before extra options start adding difficulty. */
export const DIFFICULTY_BASELINE_OPTIONS = 3;

/**
 * Coverage bonus for a poll's intrinsic difficulty: each option beyond the
 * baseline adds a step, and multiple-choice ("select all that apply") adds a
 * flat bonus. Always >= 1 — difficulty is a reward, never a penalty, so polls
 * with fewer than the baseline options (the engine permits 2-option polls even
 * though authored content is 3-20) simply get ×1.0. Only gains scale — losses
 * stay flat.
 */
export const pollDifficultyMultiplier = (
	optionCount: number,
	isMultiple: boolean
): number =>
	1 +
	OPTION_COVERAGE_STEP *
		Math.max(0, optionCount - DIFFICULTY_BASELINE_OPTIONS) +
	(isMultiple ? MULTIPLE_CHOICE_COVERAGE_BONUS : 0);

export const escalation = (gatesCleared: number): number =>
	Math.floor(gatesCleared / 2);

/**
 * Auto-escalation stops at +3: an un-upgraded Unit Tests never demands more
 * than 4 of 5, so any depth stays survivable with one miss. Only bought
 * levels can push the demand to the full window (gate.model clamps the total).
 */
export const ESCALATION_CAP = 3;

export const dropCount = (gatesCleared: number): number =>
	1 + Math.floor(gatesCleared / 2);

export const roundToOneDecimal = (value: number): number =>
	Math.round(value * 10) / 10;

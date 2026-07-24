export const SLICE_WINDOW = 5;
export const CLIMB_BASE_REQUIREMENT = 1;
export const VICTORY_GATE = 5;
/** Base storage (KB) a cleared gate pays, before Risk/Check reward multipliers. */
export const GATE_REWARD_KB = 120;
/** Hard cap (KB) on the storage currency. 1 MB — income beyond this is discarded. */
export const STORAGE_CAP_KB = 1024;
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
	return Math.min(1, gatesCleared / VICTORY_GATE);
};

export const WRONG_COVERAGE_LOSS = 0.5;

export const STREAK_COVERAGE_BONUS = 0.1;

export const streakMultiplier = (streak: number): number =>
	1 + STREAK_COVERAGE_BONUS * streak;

/**
 * Deeper gates are worth more: the base coverage a correct answer earns scales
 * with the gate number, so gate 1 pays ×1, gate 2 ×2, and so on. `gatesCleared`
 * counts gates already beaten, so the gate being answered is `gatesCleared + 1`.
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

export const dropCount = (gatesCleared: number): number =>
	1 + Math.floor(gatesCleared / 2);

export const roundToOneDecimal = (value: number): number =>
	Math.round(value * 10) / 10;

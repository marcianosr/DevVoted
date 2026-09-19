export const SLICE_WINDOW = 5;
export const VICTORY_GATE = 12;

export const GATE_COUNT = VICTORY_GATE + 1;
export const GATE_REWARD_KB = 32;

export const GATE_REWARD_MULTIPLIER_CAP = GATE_COUNT;

export type BuildSpaceRung = {
	readonly weight: number;
	readonly kb: number;
};

export const BUILD_SPACE_RUNGS: readonly BuildSpaceRung[] = [
	{ weight: 4, kb: 0 },
	{ weight: 6, kb: 16 },
	{ weight: 8, kb: 32 },
	{ weight: 12, kb: 64 },
	{ weight: 16, kb: 128 },
	{ weight: 24, kb: 256 },
	{ weight: 32, kb: 512 },
];

export const FREE_BUILD_SPACE_RUNG = 0;
export const TOP_BUILD_SPACE_RUNG = BUILD_SPACE_RUNGS.length - 1;
export const BUILD_SPACE_FROM_GATE = 2;

export const buildSpaceRungAt = (index: number): BuildSpaceRung =>
	BUILD_SPACE_RUNGS[
		Math.min(Math.max(FREE_BUILD_SPACE_RUNG, index), TOP_BUILD_SPACE_RUNG)
	];

export const buildSpaceFor = (index: number): number =>
	buildSpaceRungAt(index).weight;

export const rungIndexForSpace = (space: number): number => {
	const passed = BUILD_SPACE_RUNGS.filter((rung) => rung.weight <= space);
	return passed.length === 0 ? FREE_BUILD_SPACE_RUNG : passed.length - 1;
};

export const spaceRungFor = (space: number): BuildSpaceRung =>
	buildSpaceRungAt(rungIndexForSpace(space));

export const upkeepForSpace = (space: number): number => spaceRungFor(space).kb;

export const affordableRungIndex = (balanceKb: number): number => {
	const affordable = BUILD_SPACE_RUNGS.filter(
		(rung) => rung.kb <= Math.max(0, balanceKb)
	);
	return affordable.length === 0
		? FREE_BUILD_SPACE_RUNG
		: affordable.length - 1;
};

export const highestAffordableSpace = (balanceKb: number): number =>
	buildSpaceFor(affordableRungIndex(balanceKb));

export const BASE_SLOTS = buildSpaceFor(FREE_BUILD_SPACE_RUNG);

export const FAUCET_CAP_KB = 320;

export const faucetRemainingKb = (earnedKb: number): number =>
	Math.max(0, FAUCET_CAP_KB - earnedKb);

export const storageCreditRate = (
	reason: "victory" | "dead" | "abandoned",
	gatesCleared: number
): number => {
	if (reason === "abandoned") return 0;
	if (reason === "victory") return 1;
	return Math.min(1, gatesCleared / GATE_COUNT);
};

const STREAK_COVERAGE_BONUS = 0.1;

export const BASE_STREAK_STEPS = 10;

export const streakMultiplier = (
	streak: number,
	capSteps: number = BASE_STREAK_STEPS
): number => 1 + STREAK_COVERAGE_BONUS * Math.min(streak, capSteps);

export const streakCapMultiplier = (capSteps: number): number =>
	1 + STREAK_COVERAGE_BONUS * capSteps;

export const STREAK_UNIT_STEP = 0.1;

export const MAX_STREAK_UNIT_STEPS = SLICE_WINDOW - 1;

/**
 * Every consecutive correct answer after the first pays a step, so a flawless
 * window is worth four of them. The step is added after the multipliers and
 * never multiplied by them: inside the stack a x6 build would turn it into
 * +0.6 and the streak would stop rewarding accuracy.
 *
 * A config can buy a `growth` that makes the step climb with the streak instead
 * of staying flat (ADR-090). It is clamped to a clean window's worth of steps
 * because a failed gate does not reset the streak, so a retry would otherwise
 * open on a step no window could have earned.
 */
export const streakUnitBonus = (
	streakBefore: number,
	growth?: number
): number => {
	if (streakBefore < 1) return 0;
	if (growth === undefined) return STREAK_UNIT_STEP;
	return growth * Math.min(streakBefore, MAX_STREAK_UNIT_STEPS);
};

/** Correct answers a gate demands whatever the run score says, counted before multipliers. */
export const FLOOR_CORRECT = 2;

export const meetsGateFloor = (correct: number): boolean =>
	correct >= FLOOR_CORRECT;

export const gateRewardMultiplier = (gatesCleared: number): number =>
	gatesCleared + 1;

export const atMinimumWidth = (configCount: number): boolean =>
	configCount <= 1;

const GATE_FAIL_PEEL_SHARE = [
	0, 0.2, 0.2, 0.25, 0.25, 0.25, 0.25, 0.3, 0.3, 0.3, 0.3, 0.35, 0.35,
] as const;

export const failPeelShareFor = (gatesCleared: number): number =>
	GATE_FAIL_PEEL_SHARE[Math.min(gatesCleared, GATE_FAIL_PEEL_SHARE.length - 1)];

const EARLY_PEEL_GATES = 3;
const EARLY_PEEL_MAX_SHARE = 0.5;
const RETRY_PEEL_ESCALATION = 0.5;

export const escalatedPeelShare = (share: number, attempts: number): number =>
	share * (1 + RETRY_PEEL_ESCALATION * Math.max(0, attempts));

export const peelQuotaSlotsFor = (
	occupiedSlots: number,
	share: number,
	gatesCleared: number,
	attempts = 0
): number => {
	const escalated = escalatedPeelShare(share, attempts);

	return Math.ceil(
		occupiedSlots *
			(gatesCleared < EARLY_PEEL_GATES
				? Math.min(escalated, EARLY_PEEL_MAX_SHARE)
				: escalated)
	);
};

export const roundToOneDecimal = (value: number): number =>
	Math.round(value * 10) / 10;

/** Units carry a second decimal: a 1.25x focus on a 1.25x cache is 1.56, not 1.6. */
export const roundToTwoDecimals = (value: number): number =>
	Math.round(value * 100) / 100;

export const SHARE_STEP = 0.25;
export const MIN_PARTIAL_SHARE = SHARE_STEP;
export const MAX_PARTIAL_SHARE = SHARE_STEP * 3;

export const roundToQuarter = (ratio: number): number =>
	Math.round(ratio / SHARE_STEP) * SHARE_STEP;

export const partialShareFor = (ratio: number): number =>
	Math.min(
		MAX_PARTIAL_SHARE,
		Math.max(MIN_PARTIAL_SHARE, roundToQuarter(ratio))
	);

export const isPeelFatal = (
	quotaSlots: number,
	occupiedSlots: number
): boolean => quotaSlots >= occupiedSlots;

export const PIN_FROM_GATE = 4;

const PIN_COST_STEP_KB = 64;

export const pinCostFor = (gatesCleared: number): number =>
	PIN_COST_STEP_KB * (gatesCleared - PIN_FROM_GATE + 2);

export const PIN_UNTIL_GATE = 10;
export const PIN_START_KB_PER_GATE = 32;

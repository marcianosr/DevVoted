export const SLICE_WINDOW = 5;
export const VICTORY_GATE = 12;

export const GATE_COUNT = VICTORY_GATE + 1;
export const GATE_REWARD_KB = 32;
export const GATE_REWARD_MULTIPLIER_CAP = GATE_COUNT;

export const BASE_SLOTS = 4;

export const SLOT_PRICES_KB: readonly number[] = [
	32, 40, 48, 64, 80, 96, 120, 160, 192, 240, 288, 384, 480, 576, 704, 896,
	1152, 1408, 1792, 2304,
];

export const MAX_SLOTS = BASE_SLOTS + SLOT_PRICES_KB.length;

export const nextSlotPriceKb = (slotsBought: number): number | undefined =>
	SLOT_PRICES_KB[slotsBought];

export const slotCashOutKb = (slots: number): number | undefined =>
	SLOT_PRICES_KB[slots - BASE_SLOTS - 1];

export type StoragePlan = {
	readonly tier: number;
	readonly capKb: number;
	readonly perGateKb: number;
};

export const STORAGE_PLANS: readonly StoragePlan[] = [
	{ tier: 0, capKb: 256, perGateKb: 0 },
	{ tier: 1, capKb: 512, perGateKb: 32 },
	{ tier: 2, capKb: 1024, perGateKb: 96 },
	{ tier: 3, capKb: 2048, perGateKb: 224 },
	{ tier: 4, capKb: 3072, perGateKb: 448 },
	{ tier: 5, capKb: 5120, perGateKb: 768 },
	{ tier: 6, capKb: 10240, perGateKb: 1280 },
];

export const FREE_PLAN = STORAGE_PLANS[0];
export const TOP_PLAN = STORAGE_PLANS[STORAGE_PLANS.length - 1];

export const storagePlanFor = (tier: number): StoragePlan =>
	STORAGE_PLANS[Math.min(Math.max(0, tier), STORAGE_PLANS.length - 1)];

export const storageCapFor = (tier: number): number =>
	storagePlanFor(tier).capKb;

export const planBillKb = (tier: number): number =>
	storagePlanFor(tier).perGateKb;

export const cappedStorage = (kb: number, tier: number): number =>
	Math.min(Math.max(0, kb), storageCapFor(tier));

const ALWAYS_REVEALED_TIER = 1;

export const revealsPlanTier = (tier: number, peakKb: number): boolean =>
	tier <= ALWAYS_REVEALED_TIER || peakKb >= storageCapFor(tier - 1);

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

/**
 * Every consecutive correct answer after the first pays a flat step, so a
 * flawless window is worth four steps. It is added after the multipliers and
 * never multiplied by them: inside the stack a x6 build would turn the step
 * into +0.6 and the streak would stop rewarding accuracy.
 */
export const streakUnitBonus = (streakBefore: number): number =>
	streakBefore >= 1 ? STREAK_UNIT_STEP : 0;

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

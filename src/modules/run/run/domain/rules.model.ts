export const SLICE_WINDOW = 5;
export const VICTORY_GATE = 12;

export const GATE_COUNT = VICTORY_GATE + 1;
export const GATE_REWARD_KB = 32;
export const GATE_REWARD_MULTIPLIER_CAP = GATE_COUNT;

export const BASE_SLOTS = 4;

export const SLOT_PRICES_KB: readonly number[] = [
	16, 32, 64, 128, 192, 256, 384, 512, 768, 1024, 1536, 2048, 3072, 4096, 6144,
	8192, 12288, 16384, 24576, 32768,
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
	{ tier: 0, capKb: 512, perGateKb: 0 },
	{ tier: 1, capKb: 768, perGateKb: 16 },
	{ tier: 2, capKb: 1024, perGateKb: 32 },
	{ tier: 3, capKb: 1536, perGateKb: 64 },
	{ tier: 4, capKb: 2560, perGateKb: 128 },
	{ tier: 5, capKb: 5120, perGateKb: 384 },
	{ tier: 6, capKb: 10240, perGateKb: 768 },
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

export const WRONG_COVERAGE_LOSS = 0.5;

const STREAK_COVERAGE_BONUS = 0.1;

export const BASE_STREAK_STEPS = 10;

export const streakMultiplier = (
	streak: number,
	capSteps: number = BASE_STREAK_STEPS
): number => 1 + STREAK_COVERAGE_BONUS * Math.min(streak, capSteps);

export const streakCapMultiplier = (capSteps: number): number =>
	1 + STREAK_COVERAGE_BONUS * capSteps;

export const gateBaseMultiplier = (gatesCleared: number): number =>
	gatesCleared + 1;

const COVERAGE_DEMANDS = [
	3, 10, 25, 40, 60, 85, 110, 140, 175, 210, 250, 290, 340,
] as const;

export const coverageDemandFor = (gatesCleared: number): number =>
	COVERAGE_DEMANDS[Math.min(gatesCleared, COVERAGE_DEMANDS.length - 1)];

const OPTION_COVERAGE_STEP = 0.1;
const MULTIPLE_CHOICE_COVERAGE_BONUS = 0.5;
const DIFFICULTY_BASELINE_OPTIONS = 3;

export const pollDifficultyMultiplier = (
	optionCount: number,
	isMultiple: boolean
): number =>
	1 +
	OPTION_COVERAGE_STEP *
		Math.max(0, optionCount - DIFFICULTY_BASELINE_OPTIONS) +
	(isMultiple ? MULTIPLE_CHOICE_COVERAGE_BONUS : 0);

export const atMinimumWidth = (configCount: number): boolean =>
	configCount <= 1;

const GATE_FAIL_PEEL_SHARE = [
	0.2, 0.2, 0.2, 0.25, 0.25, 0.25, 0.25, 0.3, 0.3, 0.3, 0.3, 0.35, 0.35,
] as const;

export const failPeelShareFor = (gatesCleared: number): number =>
	GATE_FAIL_PEEL_SHARE[Math.min(gatesCleared, GATE_FAIL_PEEL_SHARE.length - 1)];

const EARLY_PEEL_GATES = 3;
const EARLY_PEEL_MAX_SHARE = 0.5;

export const peelQuotaSlotsFor = (
	occupiedSlots: number,
	share: number,
	gatesCleared: number
): number =>
	Math.ceil(
		occupiedSlots *
			(gatesCleared < EARLY_PEEL_GATES
				? Math.min(share, EARLY_PEEL_MAX_SHARE)
				: share)
	);

export const roundToOneDecimal = (value: number): number =>
	Math.round(value * 10) / 10;

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

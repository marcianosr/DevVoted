export const SLICE_WINDOW = 5;
export const VICTORY_GATE = 12;

export const GATE_COUNT = VICTORY_GATE + 1;
export const GATE_REWARD_KB = 32;
export const GATE_REWARD_MULTIPLIER_CAP = GATE_COUNT;

export type SpotRung = {
	readonly tier: number;
	readonly spots: number;
	readonly fromGate: number;
};

export const SPOT_RUNGS: readonly SpotRung[] = [
	{ tier: 1, spots: 4, fromGate: 0 },
	{ tier: 2, spots: 8, fromGate: 2 },
	{ tier: 3, spots: 12, fromGate: 5 },
	{ tier: 4, spots: 16, fromGate: 8 },
	{ tier: 5, spots: 24, fromGate: 11 },
];

export const FIRST_RUNG = SPOT_RUNGS[0];
export const TOP_RUNG = SPOT_RUNGS[SPOT_RUNGS.length - 1];

export const scheduledRung = (gatesCleared: number): SpotRung =>
	SPOT_RUNGS.filter((rung) => gatesCleared >= rung.fromGate).at(-1) ??
	FIRST_RUNG;

export const scheduledSpots = (gatesCleared: number): number =>
	scheduledRung(gatesCleared).spots;

export const spotLadderTo = (scheduledTier: number): readonly SpotRung[] =>
	SPOT_RUNGS.filter((rung) => rung.tier <= scheduledTier + 1);

export const EXTRA_SPOT_RENT_KB = 8;

export type ExtraSpotTier = {
	readonly spots: number;
	readonly fromGate: number;
};

export const EXTRA_SPOT_TIERS: readonly ExtraSpotTier[] = [
	{ spots: 1, fromGate: 0 },
	{ spots: 2, fromGate: 3 },
	{ spots: 3, fromGate: 6 },
	{ spots: 4, fromGate: 9 },
];

export const MAX_EXTRA_SPOTS =
	EXTRA_SPOT_TIERS[EXTRA_SPOT_TIERS.length - 1].spots;

export const extraRentKb = (extraSpots: number): number =>
	EXTRA_SPOT_RENT_KB * Math.max(0, extraSpots);

export const extraSpotsUnlocked = (gatesCleared: number): number =>
	EXTRA_SPOT_TIERS.filter((tier) => gatesCleared >= tier.fromGate).at(-1)
		?.spots ?? 0;

export const spotsHeldWith = (gatesCleared: number, extraSpots = 0): number =>
	scheduledSpots(gatesCleared) +
	Math.min(Math.max(0, extraSpots), MAX_EXTRA_SPOTS);

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

export const peelQuotaSpotsFor = (
	occupiedSpots: number,
	share: number,
	gatesCleared: number
): number =>
	Math.ceil(
		occupiedSpots *
			(gatesCleared < EARLY_PEEL_GATES
				? Math.min(share, EARLY_PEEL_MAX_SHARE)
				: share)
	);

export const roundToOneDecimal = (value: number): number =>
	Math.round(value * 10) / 10;

export const isPeelFatal = (
	quotaSpots: number,
	occupiedSpots: number
): boolean => quotaSpots >= occupiedSpots;

export const PIN_FROM_GATE = 4;

const PIN_COST_STEP_KB = 64;

export const pinCostFor = (gatesCleared: number): number =>
	PIN_COST_STEP_KB * (gatesCleared - PIN_FROM_GATE + 2);

export const PIN_UNTIL_GATE = 10;
export const PIN_START_KB_PER_GATE = 32;

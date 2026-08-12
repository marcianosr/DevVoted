export const SLICE_WINDOW = 5;
export const VICTORY_GATE = 12;

export const GATE_COUNT = VICTORY_GATE + 1;
export const GATE_REWARD_KB = 32;
export const GATE_REWARD_MULTIPLIER_CAP = GATE_COUNT;
export const STORAGE_CAP_KB = 512;

export type StoragePlan = {
	readonly tier: number;
	readonly capKb: number;
	readonly billKb: number;
	readonly fromGate: number;
};

export const STORAGE_PLANS: readonly StoragePlan[] = [
	{ tier: 1, capKb: STORAGE_CAP_KB, billKb: 0, fromGate: 0 },
	{ tier: 2, capKb: 640, billKb: 8, fromGate: 0 },
	{ tier: 3, capKb: 768, billKb: 16, fromGate: 2 },
	{ tier: 4, capKb: 1024, billKb: 32, fromGate: 4 },
	{ tier: 5, capKb: 1536, billKb: 48, fromGate: 6 },
	{ tier: 6, capKb: 2048, billKb: 72, fromGate: 8 },
	{ tier: 7, capKb: 3072, billKb: 112, fromGate: 10 },
];

export const storagePlanFor = (tier: number | undefined): StoragePlan =>
	STORAGE_PLANS.find((plan) => plan.tier === tier) ?? STORAGE_PLANS[0];

export const isStoragePlanUnlocked = (
	plan: StoragePlan,
	gatesCleared: number
): boolean => gatesCleared >= plan.fromGate;

export const storagePlanLadder = (
	gatesCleared: number
): readonly StoragePlan[] => {
	const unlocked = STORAGE_PLANS.filter((plan) =>
		isStoragePlanUnlocked(plan, gatesCleared)
	);
	const next = STORAGE_PLANS.find(
		(plan) => !isStoragePlanUnlocked(plan, gatesCleared)
	);
	return next ? [...unlocked, next] : unlocked;
};

export const FAUCET_CAP_KB = 320;

export const storageCreditRate = (
	reason: "victory" | "dead" | "abandoned",
	gatesCleared: number
): number => {
	if (reason === "abandoned") return 0;
	if (reason === "victory") return 1;
	return Math.min(1, gatesCleared / GATE_COUNT);
};

export const WRONG_COVERAGE_LOSS = 0.5;

export const STREAK_COVERAGE_BONUS = 0.1;

export const streakMultiplier = (streak: number): number =>
	1 + STREAK_COVERAGE_BONUS * streak;

export const gateBaseMultiplier = (gatesCleared: number): number =>
	gatesCleared + 1;

export const OPTION_COVERAGE_STEP = 0.1;
export const MULTIPLE_CHOICE_COVERAGE_BONUS = 0.5;
export const DIFFICULTY_BASELINE_OPTIONS = 3;

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

export const ESCALATION_CAP = 3;

export const dropCount = (gatesCleared: number): number =>
	1 + Math.floor(gatesCleared / 2);

export const minConfigsForGate = (gatesCleared: number): number =>
	Math.min(gatesCleared, dropCount(gatesCleared) + 1);

export const roundToOneDecimal = (value: number): number =>
	Math.round(value * 10) / 10;

export type GateStake = {
	readonly strips: number;
	readonly configs: number;
	readonly fatal: boolean;
};

export const gateStake = (strips: number, configs: number): GateStake => ({
	strips,
	configs,
	fatal: strips >= configs,
});

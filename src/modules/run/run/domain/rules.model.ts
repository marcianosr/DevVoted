export const SLICE_WINDOW = 5;
export const VICTORY_GATE = 12;

export const GATE_COUNT = VICTORY_GATE + 1;
export const GATE_REWARD_KB = 32;
export const INCIDENT_SURVIVAL_KB = 32;
export const REPACKAGE_KB = 32;

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

export const rungIndexFitting = (weight: number): number => {
	const index = BUILD_SPACE_RUNGS.findIndex((rung) => rung.weight >= weight);
	return index === -1 ? TOP_BUILD_SPACE_RUNG : index;
};

export const spaceFitting = (weight: number): number =>
	buildSpaceFor(rungIndexFitting(weight));

export const upkeepFitting = (weight: number): number =>
	buildSpaceRungAt(rungIndexFitting(weight)).kb;

export const rungAfterFitting = (weight: number): BuildSpaceRung | undefined =>
	BUILD_SPACE_RUNGS[rungIndexFitting(weight) + 1];

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

export const ESCROW_COMMIT_MULTIPLIER = 2;

export const escrowCommitKb = (pendingKb: number, earnedKb: number): number =>
	Math.min(pendingKb * ESCROW_COMMIT_MULTIPLIER, faucetRemainingKb(earnedKb));

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

export const streakMultiplier = (streak: number): number =>
	1 + STREAK_COVERAGE_BONUS * Math.min(streak, BASE_STREAK_STEPS);

export const STREAK_UNIT_STEP = 0.1;

export const streakUnitBonus = (streakBefore: number): number =>
	streakBefore < 1 ? 0 : STREAK_UNIT_STEP;

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

export const BOOT_CACHE_BANK_KB = 256;

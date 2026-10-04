import { DRAFT_COST_PER_SLOT_KB } from "~/modules/run/config/domain/config.model";
import { STORAGE_UNITS } from "~/shared/lib/storage";

export const SLICE_WINDOW = 5;
export const VICTORY_GATE = 12;

export const GATE_COUNT = VICTORY_GATE + 1;
export const GATE_REWARD_KB = 32;
export const INCIDENT_SURVIVAL_KB = 32;
export const INCIDENT_KB = 32;
export const SKIP_SHOP_KB = 16;
export const INCIDENT_REFRESH_COST_KB = [8, 16, 32, 64, 128, 256];
export const INCIDENT_OFFER_ONE_IN = 3;

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

export const BASE_SLOTS = BUILD_SPACE_RUNGS[0].weight;

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

export const bankedKb = (
	heldKb: number,
	gatesCleared: number,
	won: boolean
): number =>
	Math.round(
		heldKb * storageCreditRate(won ? "victory" : "dead", gatesCleared)
	);

export const unbankedKb = (
	heldKb: number,
	gatesCleared: number,
	won: boolean
): number => heldKb - bankedKb(heldKb, gatesCleared, won);

export const gateRewardMultiplier = (gatesCleared: number): number =>
	gatesCleared + 1;

export const atMinimumWidth = (configCount: number): boolean =>
	configCount <= 1;

export const PEEL_KB_PER_SLOT = DRAFT_COST_PER_SLOT_KB / 2;

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

export const BOOT_CACHE_RATE = 2;

export type BootCacheRung = {
	readonly storageKb: number;
	readonly archiveBytes: number;
};

const BOOT_CACHE_STORAGE_KB = [64, 128, 256];

const bootCacheRung = (storageKb: number): BootCacheRung => ({
	storageKb,
	archiveBytes: storageKb * BOOT_CACHE_RATE * STORAGE_UNITS.KB,
});

export const BOOT_CACHE_RUNGS: readonly BootCacheRung[] =
	BOOT_CACHE_STORAGE_KB.map(bootCacheRung);

export const bootCacheRungAt = (index: number): BootCacheRung | undefined =>
	BOOT_CACHE_RUNGS[index];

export const EXTEND_CARRY_BYTES = 64 * STORAGE_UNITS.KB;
export const PIN_CARRY_BYTES = 128 * STORAGE_UNITS.KB;

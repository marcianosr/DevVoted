import { STORAGE_UNITS } from "~/lib/storage";

// Fixed tiers a player can spend from their archive to front-load a new run.
// 1:1 conversion — bytes spent equal bytes added to the run's storage_limit.
// Top tier doubles as the hard per-run cap so players can't trivialise early gates.
export const STORAGE_INJECTION_TIERS = [
	64 * STORAGE_UNITS.KB,
	256 * STORAGE_UNITS.KB,
	1024 * STORAGE_UNITS.KB,
] as const;

export type StorageInjectionTier = (typeof STORAGE_INJECTION_TIERS)[number];

export const MAX_INJECTION_BYTES =
	STORAGE_INJECTION_TIERS[STORAGE_INJECTION_TIERS.length - 1];

export const isValidInjectionAmount = (
	bytes: number
): bytes is StorageInjectionTier => {
	if (bytes === 0) return true;
	return (STORAGE_INJECTION_TIERS as readonly number[]).includes(bytes);
};

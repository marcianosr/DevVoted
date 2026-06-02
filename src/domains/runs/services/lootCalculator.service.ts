import { STORAGE_UNITS } from "~/lib/storage";

/**
 * Award scales with the gate the deceased reached:
 *   loot = min(gateReached * 20, 100) KB
 *
 * - Linear in gate so deep deaths feel narratively valuable.
 * - Capped at 100 KB so a single loot can never trivialise normal earning.
 * - Returned value is in BYTES so it can be added directly to storage_limit.
 */
const LOOT_PER_GATE_KB = 20;
const LOOT_CAP_KB = 100;

export const calculateLootAmount = (gateReached: number): number => {
	if (gateReached < 1) return 0;
	const kb = Math.min(gateReached * LOOT_PER_GATE_KB, LOOT_CAP_KB);
	return kb * STORAGE_UNITS.KB;
};

export const SLICE_WINDOW = 5;
export const CLIMB_BASE_REQUIREMENT = 1;
export const VICTORY_GATE = 5;
/** Base storage (KB) a cleared gate pays, before Risk/Check reward multipliers. */
export const GATE_REWARD_KB = 120;
/** Hard cap (KB) on the storage currency. 1 MB — income beyond this is discarded. */
export const STORAGE_CAP_KB = 1024;
/**
 * Share of leftover storage credited to archived_storage when a run is
 * abandoned (won/dead credit 100%) — walking away costs half (DVTD-li9i).
 */
export const ABANDON_STORAGE_CREDIT_RATE = 0.5;

export const escalation = (gatesCleared: number): number =>
	Math.floor(gatesCleared / 2);

export const dropCount = (gatesCleared: number): number =>
	1 + Math.floor(gatesCleared / 2);

export const roundToOneDecimal = (value: number): number =>
	Math.round(value * 10) / 10;

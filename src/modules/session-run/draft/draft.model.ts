import { Config } from "../configs/config.model";
import { CONFIG_LIST } from "../configs/configRoster.model";

export const DRAFT_SIZE = 3;

const REBUILD_FIB_KB = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

export const rebuildCost = (rebuildsUsed: number): number =>
	REBUILD_FIB_KB[rebuildsUsed] ?? REBUILD_FIB_KB[REBUILD_FIB_KB.length - 1];

export const rollDraft = (
	seed: number,
	equipped: readonly Config[]
): readonly Config[] => {
	// Drafts offer NEW configs only — owned configs are upgraded in the shop, not re-drafted.
	const owned = new Set(equipped.map((config) => config.id));
	const pool = CONFIG_LIST.filter(
		(config) => !owned.has(config.id) && !config.fixed
	);
	return Array.from(
		{ length: Math.min(DRAFT_SIZE, pool.length) },
		(_, offset) => pool[(seed + offset) % pool.length]
	);
};

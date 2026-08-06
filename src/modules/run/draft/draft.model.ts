import { Config } from "../configs/config.model";
import { CONFIG_LIST } from "../configs/configRoster.model";

export const DRAFT_SIZE = 3;

const REBUILD_COST_KB = [4, 8, 16, 32, 64, 128, 256, 512];

export const rebuildCost = (rebuildsUsed: number): number =>
	REBUILD_COST_KB[rebuildsUsed] ?? REBUILD_COST_KB[REBUILD_COST_KB.length - 1];

/**
 * The seed for a gate's draft. Gate and rebuild count are mixed by distinct odd
 * multipliers rather than summed, because a sum collides: gate 1's opening draft
 * would equal gate 0's first rebuild, handing back the offers a player just paid
 * to replace.
 */
export const draftSeed = (gatesCleared: number, rebuildsUsed: number): number =>
	gatesCleared * 0x9e37 + rebuildsUsed * 0x85eb;

/**
 * mulberry32 — a small seeded PRNG. Drafts must stay pure and reproducible:
 * run state is snapshotted and rehydrated (`runSnapshot.model.ts`), so
 * `Math.random()` would resurrect a different shop than the one the player left.
 */
const randomFrom = (seed: number): (() => number) => {
	let state = seed | 0;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
		mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
		return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
	};
};

export const rollDraft = (
	seed: number,
	equipped: readonly Config[]
): readonly Config[] => {
	// Drafts offer NEW configs only — owned configs are upgraded in the shop, not re-drafted.
	const owned = new Set(equipped.map((config) => config.id));
	const pool = [...CONFIG_LIST.filter((config) => !owned.has(config.id))];
	const nextRandom = randomFrom(seed);
	const size = Math.min(DRAFT_SIZE, pool.length);

	// Partial Fisher-Yates: draw `size` distinct configs by swapping each pick to
	// the front. Local mutation of this function's own copy keeps it pure.
	for (let picked = 0; picked < size; picked++) {
		const swapWith = picked + Math.floor(nextRandom() * (pool.length - picked));
		const held = pool[picked];
		pool[picked] = pool[swapWith];
		pool[swapWith] = held;
	}

	return pool.slice(0, size);
};

import { Config } from "../configs/config.model";
import { CONFIG_LIST } from "../configs/configRoster.model";

export const DRAFT_SIZE = 5;

const REBUILD_COST_KB = [4, 8, 16, 32, 64, 128, 256, 512];

export const rebuildCost = (rebuildsUsed: number): number =>
	REBUILD_COST_KB[rebuildsUsed] ?? REBUILD_COST_KB[REBUILD_COST_KB.length - 1];

export const LOCK_COST_KB = 16;

export const MAX_LOCKED_OFFERS = 1;

const EXTEND_COST_KB = [48, 96];

export const MAX_EXTENSIONS = EXTEND_COST_KB.length;

export const extendCost = (extensionsBought: number): number =>
	EXTEND_COST_KB[extensionsBought] ?? EXTEND_COST_KB[MAX_EXTENSIONS - 1];

export const offerCount = (extensionsBought: number): number =>
	DRAFT_SIZE + Math.min(extensionsBought, MAX_EXTENSIONS);

export const LOCK_FROM_GATE = 2;
export const EXTEND_FROM_GATE = 3;

export const draftSeed = (
	gatesCleared: number,
	rebuildsUsed: number,
	extensionsBought: number = 0
): number =>
	gatesCleared * 0x9e37 + rebuildsUsed * 0x85eb + extensionsBought * 0xc2b2;

const randomFrom = (seed: number): (() => number) => {
	let state = seed | 0;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
		mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
		return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
	};
};

const lockedConfigs = (lockedIds: readonly string[]): readonly Config[] =>
	lockedIds
		.map((id) => CONFIG_LIST.find((config) => config.id === id))
		.filter((config): config is Config => config !== undefined);

export const rollDraft = (
	seed: number,
	equipped: readonly Config[],
	lockedIds: readonly string[] = [],
	offers: number = DRAFT_SIZE
): readonly Config[] => {
	const owned = new Set(equipped.map((config) => config.id));
	const held = lockedConfigs(lockedIds).filter(
		(config) => !owned.has(config.id)
	);
	const pinned = new Set(held.map((config) => config.id));
	const pool = [
		...CONFIG_LIST.filter(
			(config) => !owned.has(config.id) && !pinned.has(config.id)
		),
	];
	const nextRandom = randomFrom(seed);
	const size = Math.min(Math.max(0, offers - held.length), pool.length);

	for (let picked = 0; picked < size; picked++) {
		const swapWith = picked + Math.floor(nextRandom() * (pool.length - picked));
		const swapped = pool[picked];
		pool[picked] = pool[swapWith];
		pool[swapWith] = swapped;
	}

	return [...held, ...pool.slice(0, size)];
};

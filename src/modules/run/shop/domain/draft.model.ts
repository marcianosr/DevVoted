import {
	Config,
	draftCost,
	isUpgradable,
	maxLevelOf,
	sellRefund,
} from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";

export const DRAFT_SIZE = 5;

const REBUILD_COST_KB = [4, 8, 16, 32, 64, 128, 256, 512];

export const rebuildCost = (rebuildsUsed: number): number =>
	REBUILD_COST_KB[rebuildsUsed] ?? REBUILD_COST_KB[REBUILD_COST_KB.length - 1];

export const LOCK_COST_KB = 16;

const EXTEND_COST_KB = [48, 96];

export const MAX_EXTENSIONS = EXTEND_COST_KB.length;

export const extendCost = (extensionsBought: number): number =>
	EXTEND_COST_KB[extensionsBought] ?? EXTEND_COST_KB[MAX_EXTENSIONS - 1];

export const offerCount = (extensionsBought: number): number =>
	DRAFT_SIZE + Math.min(extensionsBought, MAX_EXTENSIONS);

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

export const shopOffersFullRoster = (configs: readonly Config[]): boolean =>
	configs.some((config) => config.offersFullRoster === true);

const draftDiscountIn = (configs: readonly Config[]): number =>
	configs.reduce((factor, config) => factor * (config.draftCostFactor ?? 1), 1);

export const draftCostIn = (
	configs: readonly Config[],
	config: Config
): number => Math.floor(draftCost(config) * draftDiscountIn(configs));

export const sellRefundIn = (
	configs: readonly Config[],
	config: Config
): number => {
	if (shopOffersFullRoster(configs)) return 0;
	if (draftDiscountIn(configs) === 1) return sellRefund(config);
	return Math.floor(draftCostIn(configs, config) / 2);
};

export const UPGRADE_OFFER_ONE_IN = 8;

export const CLIMB_ONE_IN = 2;

const UPGRADE_OFFER_SEED = 0x5bf0;

const FIRST_VERSION = 1;

const climbFrom = (
	nextRandom: () => number,
	held: number,
	maxLevel: number
): number => {
	let level = held + 1;
	while (level < maxLevel && nextRandom() * CLIMB_ONE_IN < 1) level += 1;
	return level;
};

export const upgradeOfferFor = (
	seed: number,
	equipped: readonly Config[]
): Config | undefined => {
	const upgradable = equipped.filter(isUpgradable);
	if (upgradable.length === 0) return undefined;

	const nextRandom = randomFrom(seed ^ UPGRADE_OFFER_SEED);
	if (nextRandom() * UPGRADE_OFFER_ONE_IN >= 1) return undefined;

	const picked = upgradable[Math.floor(nextRandom() * upgradable.length)];
	if (picked === undefined) return undefined;
	return {
		...picked,
		level: climbFrom(
			nextRandom,
			picked.level ?? FIRST_VERSION,
			maxLevelOf(picked)
		),
	};
};

export type VersionOdds = {
	readonly version: number;
	readonly share: number;
};

export const versionOddsFor = (
	held: number,
	maxLevel: number
): readonly VersionOdds[] => {
	const rungs = maxLevel - held;
	if (rungs <= 0) return [];

	const flipsTo = (rung: number) => (rung === rungs ? rungs - 1 : rung);

	return Array.from({ length: rungs }, (_, index) => ({
		version: held + index + 1,
		share: 1 / CLIMB_ONE_IN ** flipsTo(index + 1),
	}));
};

export const offerOddsOf = (held: number, offer: Config): number | undefined =>
	versionOddsFor(held, maxLevelOf(offer)).find(
		(odds) => odds.version === (offer.level ?? FIRST_VERSION)
	)?.share;

export const isUpgradeOffer = (
	configs: readonly Config[],
	offer: Config
): boolean => {
	const owned = configs.find((config) => config.id === offer.id);
	return owned !== undefined && (offer.level ?? 1) > (owned.level ?? 1);
};

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
	if (shopOffersFullRoster(equipped)) return [...held, ...pool];
	const nextRandom = randomFrom(seed);
	const size = Math.min(Math.max(0, offers - held.length), pool.length);

	for (let picked = 0; picked < size; picked++) {
		const swapWith = picked + Math.floor(nextRandom() * (pool.length - picked));
		const swapped = pool[picked];
		pool[picked] = pool[swapWith];
		pool[swapWith] = swapped;
	}

	const rolled = [...held, ...pool.slice(0, size)];
	const upgrade = size === 0 ? undefined : upgradeOfferFor(seed, equipped);
	if (upgrade === undefined) return rolled;
	return [...rolled.slice(0, -1), upgrade];
};

import {
	Config,
	draftCost,
	isUpgradable,
	levelUp,
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

/** Whether the build holds the license (WTFPL) that opens every draft to the
 * whole catalog and retires the paid shop controls. */
export const shopOffersFullRoster = (configs: readonly Config[]): boolean =>
	configs.some((config) => config.offersFullRoster === true);

/** The discount the build applies to every price on the shelf (Freemium), as a
 * fraction of list. Multiplied rather than picked, so two discounts would
 * compose instead of one silently winning. */
const draftDiscountIn = (configs: readonly Config[]): number =>
	configs.reduce((factor, config) => factor * (config.draftCostFactor ?? 1), 1);

/**
 * What drafting `config` costs this build. The price lives here rather than on
 * the config because a discount is a property of the build holding it, the
 * same reason `sellRefundIn` exists — and every surface that quotes a price
 * (the shop, the refusal copy, the reducer's charge) must read the same one.
 */
export const draftCostIn = (
	configs: readonly Config[],
	config: Config
): number => Math.floor(draftCost(config) * draftDiscountIn(configs));

/**
 * What selling `config` out of this build refunds. WTFPL's no-warranty clause
 * zeroes every sale while it is installed — its own included, so the license
 * cannot be flipped for half its price after opening the catalog.
 *
 * Otherwise a sale returns half of what the build actually *paid*, not half of
 * list: under Freemium's half-price shelf a list-priced refund would equal the
 * discounted draft, making churn free and build commitment meaningless. No
 * refunds on discounted goods.
 */
export const sellRefundIn = (
	configs: readonly Config[],
	config: Config
): number => {
	if (shopOffersFullRoster(configs)) return 0;
	if (draftDiscountIn(configs) === 1) return sellRefund(config);
	return Math.floor(draftCostIn(configs, config) / 2);
};

export const UPGRADE_OFFER_ONE_IN = 8;

const UPGRADE_OFFER_SEED = 0x5bf0;

export const upgradeOfferFor = (
	seed: number,
	equipped: readonly Config[]
): Config | undefined => {
	const upgradable = equipped.filter(isUpgradable);
	if (upgradable.length === 0) return undefined;

	const nextRandom = randomFrom(seed ^ UPGRADE_OFFER_SEED);
	if (nextRandom() * UPGRADE_OFFER_ONE_IN >= 1) return undefined;

	const picked = upgradable[Math.floor(nextRandom() * upgradable.length)];
	return picked === undefined ? undefined : levelUp(picked);
};

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
	// The license, honored literally: the whole catalog in roster order — a
	// rolled subset would be withholding exactly what was paid for.
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

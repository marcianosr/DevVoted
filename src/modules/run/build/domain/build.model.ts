import type { CategoryCode } from "~/shared/lib/categories";

import {
	Config,
	minifiedAmount,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import { effectOf } from "~/modules/run/config/domain/effect.model";
import {
	GATE_REWARD_KB,
	GATE_REWARD_MULTIPLIER_CAP,
	SLICE_WINDOW,
	TOP_BUILD_SPACE_RUNG,
	buildSpaceFor,
	gateRewardMultiplier,
	rungAfterFitting,
	spaceFitting,
	streakMultiplier,
	upkeepFitting,
} from "~/modules/run/run/domain/rules.model";

export type Build = {
	readonly id: string;
	readonly configs: readonly Config[];
	readonly vendorLockedConfigId?: string;
};

export const occupiedSlots = (configs: readonly Config[]): number =>
	configs.reduce((total, config) => total + slotsOf(config), 0);

/**
 * What the rented space is measured against (ADR-087). The weight a build
 * carries and the weight it is held to are no longer the same number: a
 * vendor-locked config still occupies the build, and still counts toward the
 * peel quota and the over-width burn, but the rung it is held to ignores it.
 */
export const billableSlotsOf = (build: Build): number =>
	occupiedSlots(
		build.configs.filter((config) => config.id !== build.vendorLockedConfigId)
	);

/**
 * The space the build rents (ADR-098). Derived, never stored: the rung follows
 * the build, so there is no held value that can drift from what is installed.
 * Reading `billableSlotsOf` is what keeps vendor lock-in's exemption (ADR-087)
 * working here for free.
 */
export const spaceForBuild = (build: Build): number =>
	spaceFitting(billableSlotsOf(build));

export const upkeepForBuild = (build: Build): number =>
	upkeepFitting(billableSlotsOf(build));

/** What crossing into the next rung would cost, or undefined at the top of the ladder. */
export const rungAfterBuild = (build: Build) =>
	rungAfterFitting(billableSlotsOf(build));

export const freeSlots = (build: Build): number =>
	Math.max(0, spaceForBuild(build) - billableSlotsOf(build));

/**
 * The top rung is the only hard cap left. Everything below it the build simply
 * grows into and is billed for, so room can no longer refuse an offer that the
 * balance could pay for.
 */
export const MAX_BUILD_WEIGHT = buildSpaceFor(TOP_BUILD_SPACE_RUNG);

export const hasRoomFor = (build: Build, slots: number): boolean =>
	billableSlotsOf(build) + slots <= MAX_BUILD_WEIGHT;

export const overflowSlots = (build: Build): number =>
	Math.max(0, billableSlotsOf(build) - MAX_BUILD_WEIGHT);

export const isOverCapacity = (build: Build): boolean =>
	overflowSlots(build) > 0;

export const isBare = (build: Build): boolean =>
	build.configs.length === 0;

const effects = (configs: readonly Config[]) => configs.map(effectOf);

export const rewardMultiplierFor = (configs: readonly Config[]): number =>
	effects(configs).reduce(
		(product, effect) => product * (effect.rewardMultiplier ?? 1),
		1
	);

export type FlatClearPayout = { readonly config: Config; readonly kb: number };

export const flatClearPayoutsOf = (
	configs: readonly Config[]
): readonly FlatClearPayout[] =>
	configs
		.map((config) => ({ config, kb: effectOf(config).storageOnClear ?? 0 }))
		.filter((payout) => payout.kb > 0);

export const storageOnClearFor = (configs: readonly Config[]): number =>
	flatClearPayoutsOf(configs).reduce((total, payout) => total + payout.kb, 0);

export const storageInterestFor = (
	configs: readonly Config[],
	heldKb: number
): number =>
	Math.floor(
		(heldKb *
			effects(configs).reduce(
				(pct, effect) => pct + (effect.storageInterestPct ?? 0),
				0
			)) /
			100
	);

export const extraPickPayoutFor = (
	configs: readonly Config[],
	extraPicks: number
): number =>
	configs.reduce(
		(total, config) =>
			total +
			minifiedAmount(config, config.storagePerExtraPick ?? 0) *
				Math.max(0, extraPicks),
		0
	);

export type BuildModifiers = {
	readonly gateReward: number;
	readonly rewardMultiplier: number;
};

export const buildModifiersFor = (
	configs: readonly Config[],
	gatesCleared: number
): BuildModifiers => ({
	rewardMultiplier: rewardMultiplierFor(configs),
	gateReward: gateClearPayout(configs, SLICE_WINDOW, gatesCleared),
});

export const gateClearPayout = (
	configs: readonly Config[],
	correct: number,
	gatesCleared: number,
	streak = 0
): number =>
	Math.round(
		GATE_REWARD_KB *
			Math.min(gateRewardMultiplier(gatesCleared), GATE_REWARD_MULTIPLIER_CAP) *
			rewardMultiplierFor(configs) *
			streakMultiplier(streak) *
			(correct / SLICE_WINDOW)
	) + storageOnClearFor(configs);

export const wagererFor = (
	configs: readonly Config[]
): Config | undefined =>
	configs.find((config) => config.wagersAnswer !== undefined);

export const linterFor = (
	configs: readonly Config[],
	category: CategoryCode
): Config | undefined =>
	configs.find((config) => effectOf(config).maskWrongOn?.(category) === true);

export const canLint = (
	configs: readonly Config[],
	category: CategoryCode
): boolean => linterFor(configs, category) !== undefined;

export const peekerFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.peeksCommunitySplit === true);

export const budgeterFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.revealsCorrectCount === true);

export const prefetcherFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.revealsUpcomingCategories === true);

export const projectorFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.projectsGateOutcome === true);

export const lockerFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.locksOffers === true);

export const locksSurviving = (
	configs: readonly Config[],
	lockedOfferIds: readonly string[] | undefined
): readonly string[] =>
	lockerFor(configs) === undefined ? [] : (lockedOfferIds ?? []);

export const vendorLockerFor = (
	configs: readonly Config[]
): Config | undefined => configs.find((config) => config.vendorLocks === true);

export const catcherFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.catchesFatal === true);

/**
 * The lock dies with the config it names or with the one that granted it, so
 * the id can never dangle past either. Every build rewrite goes through here
 * rather than through a prune at each call site, which is what keeps the
 * engine's own removals (a decayed config, a lapsed subscription) honest
 * without each of them having to know the lock exists.
 */
export const withVendorLockSurviving = (build: Build): Build => {
	const locked = build.vendorLockedConfigId;
	if (locked === undefined) return build;
	const survives =
		vendorLockerFor(build.configs) !== undefined &&
		build.configs.some((config) => config.id === locked);
	if (survives) return build;
	const { vendorLockedConfigId: _cleared, ...rest } = build;
	return rest;
};

export const stripConfig = (build: Build, configId: string): Build =>
	withVendorLockSurviving({
		...build,
		configs: build.configs.filter((config) => config.id !== configId),
	});

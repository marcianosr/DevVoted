import type { CategoryCode } from "~/shared/lib/categories";

import {
	Config,
	minifiedAmount,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import { effectOf } from "~/modules/run/config/domain/effect.model";
import {
	type CoverageBand,
	perfectBonusKbFor,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	GATE_REWARD_KB,
	GATE_REWARD_MULTIPLIER_CAP,
	SLICE_WINDOW,
	gateRewardMultiplier,
} from "~/modules/run/run/domain/rules.model";

export type Build = {
	readonly id: string;
	readonly configs: readonly Config[];
	readonly vendorLockedConfigId?: string;
};

export const occupiedSlots = (configs: readonly Config[]): number =>
	configs.reduce((total, config) => total + slotsOf(config), 0);

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
	gatesCleared: number
): number =>
	Math.round(
		GATE_REWARD_KB *
			Math.min(gateRewardMultiplier(gatesCleared), GATE_REWARD_MULTIPLIER_CAP) *
			rewardMultiplierFor(configs) *
			(correct / SLICE_WINDOW)
	) + storageOnClearFor(configs);

export const perfectBonusOnClear = (
	configs: readonly Config[],
	band: CoverageBand,
	clearKb: number
): number => perfectBonusKbFor(band, clearKb - storageOnClearFor(configs));

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

export const crowdSubmitterFor = (
	configs: readonly Config[]
): Config | undefined =>
	configs.find((config) => config.submitsCrowdPick === true);

export const budgeterFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.revealsCorrectCount === true);

export const prefetcherFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.revealsUpcomingCategories === true);

export const auditorFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.revealsOutageTargets === true);


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

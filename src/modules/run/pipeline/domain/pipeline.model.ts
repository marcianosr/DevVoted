import type { CategoryCode } from "~/shared/lib/categories";

import {
	Config,
	faucetKbPerCorrect,
	focusMultiplierOf,
	minifiedAmount,
	minifiedMultiplier,
	spotsOf,
} from "~/modules/run/config/domain/config.model";
import {
	AnswerContext,
	Coverage,
	effectOf,
} from "~/modules/run/config/domain/effect.model";
import {
	BASE_STREAK_STEPS,
	GATE_REWARD_KB,
	GATE_REWARD_MULTIPLIER_CAP,
	SLICE_WINDOW,
	FIRST_RUNG,
	MAX_EXTRA_SPOTS,
	TOP_RUNG,
	WRONG_COVERAGE_LOSS,
	gateBaseMultiplier,
	roundToOneDecimal,
	streakCapMultiplier,
	streakMultiplier,
} from "~/modules/run/run/domain/rules.model";

export type Pipeline = {
	readonly id: string;
	readonly spots: number;
	readonly configs: readonly Config[];
};

export const BASE_SPOTS = FIRST_RUNG.spots;
export const FREE_SPOTS_CEILING = TOP_RUNG.spots;
export const MAX_SPOTS = TOP_RUNG.spots + MAX_EXTRA_SPOTS;

export const occupiedSpots = (configs: readonly Config[]): number =>
	configs.reduce((total, config) => total + spotsOf(config), 0);

export const freeSpots = (pipeline: Pipeline): number =>
	Math.max(0, pipeline.spots - occupiedSpots(pipeline.configs));

export const hasRoomFor = (pipeline: Pipeline, spots: number): boolean =>
	occupiedSpots(pipeline.configs) + spots <= pipeline.spots;

export const overflowSpots = (pipeline: Pipeline): number =>
	Math.max(0, occupiedSpots(pipeline.configs) - pipeline.spots);

export const isOverCapacity = (pipeline: Pipeline): boolean =>
	overflowSpots(pipeline) > 0;

export const isBare = (pipeline: Pipeline): boolean =>
	pipeline.configs.length === 0;

const effects = (configs: readonly Config[]) => configs.map(effectOf);

export const rewardMultiplierFor = (configs: readonly Config[]): number =>
	effects(configs).reduce(
		(product, effect) => product * (effect.rewardMultiplier ?? 1),
		1
	);

const storageOnClearFor = (configs: readonly Config[]): number =>
	effects(configs).reduce(
		(total, effect) => total + (effect.storageOnClear ?? 0),
		0
	);

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

const coverageProfileFor = (
	configs: readonly Config[]
): { readonly mult: number; readonly add: number } =>
	configs.reduce(
		(profile, config) => ({
			mult:
				profile.mult *
				minifiedMultiplier(config, config.coverageMultiplier ?? 1),
			add: profile.add + minifiedAmount(config, config.coverageAdd ?? 0),
		}),
		{ mult: 1, add: 0 }
	);

export type PipelineModifiers = {
	readonly gateReward: number;
	readonly rewardMultiplier: number;
	readonly coverageMultiplier: number;
	readonly coverageAdd: number;
};

export const pipelineModifiersFor = (
	configs: readonly Config[],
	gatesCleared: number
): PipelineModifiers => {
	const rewardMultiplier = rewardMultiplierFor(configs);
	const coverage = coverageProfileFor(configs);
	return {
		rewardMultiplier,
		coverageMultiplier: coverage.mult,
		coverageAdd: coverage.add,
		gateReward: gateClearPayout(configs, SLICE_WINDOW, gatesCleared),
	};
};

export type PerAnswerPreview = {
	readonly coveragePerCorrect: number;
	readonly coveragePerWrong: number;
	readonly storageKbPerCorrect: number;
	readonly matchingConfigMultiplier?: number;
	readonly streakStepMultiplier: number;
	readonly streakCapMultiplier: number;
};

export const streakCapStepsFor = (configs: readonly Config[]): number =>
	BASE_STREAK_STEPS +
	effects(configs).reduce(
		(steps, effect) => steps + (effect.streakCapSteps ?? 0),
		0
	);

const throttleFor = (configs: readonly Config[]): number =>
	configs.reduce(
		(product, config) => product * (config.throttleCoverageMultiplier ?? 1),
		1
	);

export const gateClearPayout = (
	configs: readonly Config[],
	correct: number,
	gatesCleared: number
): number =>
	Math.round(
		GATE_REWARD_KB *
			Math.min(gateBaseMultiplier(gatesCleared), GATE_REWARD_MULTIPLIER_CAP) *
			rewardMultiplierFor(configs) *
			(correct / SLICE_WINDOW)
	) + storageOnClearFor(configs);

const coveragePerCorrectRaw = (
	configs: readonly Config[],
	gatesCleared: number
): number => {
	const { mult, add } = coverageProfileFor(configs);
	return (
		gateBaseMultiplier(gatesCleared) * (1 + add) * mult * throttleFor(configs)
	);
};

export const coverageLossFor = (
	configs: readonly Config[],
	gatesCleared: number
): number =>
	roundToOneDecimal(
		WRONG_COVERAGE_LOSS * coveragePerCorrectRaw(configs, gatesCleared)
	);

export const perAnswerPreviewFor = (
	configs: readonly Config[],
	gatesCleared: number
): PerAnswerPreview => {
	const focusMultipliers = configs
		.filter((config) => config.focusCategory !== undefined)
		.map(focusMultiplierOf);
	return {
		coveragePerCorrect: roundToOneDecimal(
			coveragePerCorrectRaw(configs, gatesCleared)
		),
		coveragePerWrong: -coverageLossFor(configs, gatesCleared),
		storageKbPerCorrect: faucetKbPerCorrect(configs),
		matchingConfigMultiplier:
			focusMultipliers.length > 0 ? Math.max(...focusMultipliers) : undefined,
		streakStepMultiplier: streakMultiplier(1),
		streakCapMultiplier: streakCapMultiplier(streakCapStepsFor(configs)),
	};
};

export const coverageForAnswer = (
	configs: readonly Config[],
	context: AnswerContext,
	share: number,
	streakFactor = 1
): number => {
	if (share <= 0) return 0;
	const covers = configs
		.map((config) => effectOf(config).coverage?.(context))
		.filter((cover): cover is Coverage => cover !== undefined);
	const mult = covers.reduce((product, cover) => product * cover.mult, 1);
	const add = covers.reduce((sum, cover) => sum + cover.add, 0);
	return roundToOneDecimal(share * (1 + add) * mult * streakFactor);
};

export type CoverageConfigBonus = {
	readonly configId: string;
	readonly value: number;
};

export type CoverageFactors = {
	readonly correct: number;
	readonly build: number;
	readonly streak: number;
};

export const coverageFactorsForAnswer = (
	configs: readonly Config[],
	context: AnswerContext,
	share: number,
	streakFactor = 1
): CoverageFactors | undefined => {
	if (share <= 0) return undefined;
	const covers = configs
		.map((config) => effectOf(config).coverage?.(context))
		.filter((cover): cover is Coverage => cover !== undefined);
	const mult = covers.reduce((product, cover) => product * cover.mult, 1);
	const add = covers.reduce((sum, cover) => sum + cover.add, 0);
	return { correct: share, build: (1 + add) * mult, streak: streakFactor };
};

export type CoverageBreakdown = {
	readonly base: number;
	readonly streakBonus: number;
	readonly configBonuses: readonly CoverageConfigBonus[];
};

export const coverageBreakdownForAnswer = (
	configs: readonly Config[],
	context: AnswerContext,
	share: number,
	streakFactor: number,
	coverageLoss: number
): CoverageBreakdown => {
	if (share <= 0) {
		return {
			base: roundToOneDecimal(-coverageLoss),
			streakBonus: 0,
			configBonuses: [],
		};
	}

	const earned = coverageForAnswer(configs, context, share, streakFactor);
	const earnedBeforeStreak = coverageForAnswer(configs, context, share, 1);
	const streakBonus = roundToOneDecimal(earned - earnedBeforeStreak);

	const covered = configs
		.map((config) => ({
			config,
			cover: effectOf(config).coverage?.(context),
		}))
		.filter(
			(entry): entry is { config: Config; cover: Coverage } =>
				entry.cover !== undefined
		);

	const totalAdd = covered.reduce((sum, entry) => sum + entry.cover.add, 0);
	const orderedCovered = [
		...covered.filter((entry) => entry.cover.mult === 1),
		...covered.filter((entry) => entry.cover.mult !== 1),
	];
	let subtotal = share * (1 + totalAdd);
	const configBonuses = orderedCovered
		.map(({ config, cover }) => {
			if (cover.mult !== 1) {
				const value = roundToOneDecimal(subtotal * (cover.mult - 1));
				subtotal *= cover.mult;
				return { configId: config.id, value };
			}
			return {
				configId: config.id,
				value: roundToOneDecimal(share * cover.add),
			};
		})
		.filter((bonus) => bonus.value !== 0);

	const bonusTotal = configBonuses.reduce((sum, bonus) => sum + bonus.value, 0);
	const base = roundToOneDecimal(earned - streakBonus - bonusTotal);

	return { base, streakBonus, configBonuses };
};

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

export const stripConfig = (
	pipeline: Pipeline,
	configId: string
): Pipeline => ({
	...pipeline,
	configs: pipeline.configs.filter((config) => config.id !== configId),
});

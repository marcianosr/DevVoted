import type { CategoryCode } from "~/domains/shared/categories";

import { Config } from "../configs/config.model";
import { Coverage, effectOf } from "../configs/effect.model";
import { roundToOneDecimal } from "../rules.model";

export type Pipeline = {
	readonly id: string;
	readonly slots: number;
	readonly configs: readonly Config[];
};

export const BASE_SLOTS = 3;
export const MAX_SLOTS = 12;

/** Total-coverage % required to unlock each slot (ADR-008), keyed by target slot count. */
const SLOT_COVERAGE_GATE: Readonly<Record<number, number>> = {
	4: 11,
	5: 25,
	6: 50,
	7: 80,
	8: 110,
	9: 150,
	10: 195,
	11: 230,
	12: 270,
};

/** Total coverage needed to add the next slot; Infinity once the cap is reached. */
export const coverageToAddSlot = (currentSlots: number): number =>
	SLOT_COVERAGE_GATE[currentSlots + 1] ?? Infinity;

/** A slot can be added only below the cap and once its coverage gate is met. */
export const canAddSlot = (currentSlots: number, coverage: number): boolean =>
	currentSlots < MAX_SLOTS && coverage >= coverageToAddSlot(currentSlots);

export const isFixed = (config: Config): boolean => config.fixed === true;

export const freeConfigs = (pipeline: Pipeline): readonly Config[] =>
	pipeline.configs.filter((config) => !isFixed(config));

export const isBare = (pipeline: Pipeline): boolean =>
	freeConfigs(pipeline).length === 0;

const effects = (pipeline: Pipeline) => pipeline.configs.map(effectOf);

export const effectiveRequirement = (
	pipeline: Pipeline,
	base: number
): number => {
	const raised = effects(pipeline).reduce(
		(total, effect) => total + (effect.requirementDelta ?? 0),
		0
	);
	return Math.max(1, base + raised);
};

export const rewardMultiplierFor = (pipeline: Pipeline): number =>
	effects(pipeline).reduce(
		(product, effect) => product * (effect.rewardMultiplier ?? 1),
		1
	);

/** Build-wide coverage boost applied to every correct answer (Focus category bonuses excluded). */
export const coverageProfileFor = (
	pipeline: Pipeline
): { readonly mult: number; readonly add: number } =>
	pipeline.configs.reduce(
		(profile, config) => ({
			mult: profile.mult * (config.coverageMultiplier ?? 1),
			add: profile.add + (config.coverageAdd ?? 0),
		}),
		{ mult: 1, add: 0 }
	);

/**
 * Coverage a single answer earns: `share × (1 + adds) × mults × streak`. The
 * base correctness is `1`; flat config adds are applied first, then every
 * multiplier last (config mults AND streak), so a ×2 amplifies the adds too and
 * all multipliers compose identically. `share` is the answer's correctness in
 * [0, 1]: 1 fully correct, fractional for a partial multi-pick, 0 for a miss.
 * Configs amplify gains only — they never touch losses.
 */
export const coverageForAnswer = (
	configs: readonly Config[],
	category: CategoryCode,
	share: number,
	streakFactor = 1
): number => {
	if (share <= 0) return 0;
	const covers = configs
		.map((config) => effectOf(config).coverage?.(category))
		.filter((cover): cover is Coverage => cover !== undefined);
	const mult = covers.reduce((product, cover) => product * cover.mult, 1);
	const add = covers.reduce((sum, cover) => sum + cover.add, 0);
	return roundToOneDecimal(share * (1 + add) * mult * streakFactor);
};

export type CoverageConfigBonus = {
	readonly configId: string;
	readonly value: number;
};

export type CoverageBreakdown = {
	readonly base: number;
	readonly streakBonus: number;
	readonly configBonuses: readonly CoverageConfigBonus[];
};

/**
 * Splits a single answer's coverage into the chips the reveal shows: the
 * correctness base, the streak bonus, and each coverage-affecting config's
 * contribution. Mirrors the multipliers-last formula — flat adds show their
 * face value; each multiplier absorbs the amplification it applies to the
 * running subtotal (base + adds + earlier multipliers). `base` is the remainder
 * so the parts always sum to `coverageForAnswer`. A miss carries the loss as a
 * negative base with no bonuses — configs never amplify losses.
 */
export const coverageBreakdownForAnswer = (
	configs: readonly Config[],
	category: CategoryCode,
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

	const earned = coverageForAnswer(configs, category, share, streakFactor);
	const earnedBeforeStreak = coverageForAnswer(configs, category, share, 1);
	const streakBonus = roundToOneDecimal(earned - earnedBeforeStreak);

	const covered = configs
		.map((config) => ({
			config,
			cover: effectOf(config).coverage?.(category),
		}))
		.filter(
			(entry): entry is { config: Config; cover: Coverage } =>
				entry.cover !== undefined
		);

	const totalAdd = covered.reduce((sum, entry) => sum + entry.cover.add, 0);
	// Subtotal the multipliers amplify: the base plus every flat add. Each
	// multiplier grows it in turn (mults compose last), so its chip reflects the
	// gain it produced over everything earned so far.
	let subtotal = share * (1 + totalAdd);
	const configBonuses = covered
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

/** Whether the manual lint action is available — any equipped config that masks wrong options. */
/** The equipped linter that covers this poll's category, if any (ESLint → JS/TS, Stylelint → CSS). */
export const linterFor = (
	configs: readonly Config[],
	category: CategoryCode
): Config | undefined =>
	configs.find((config) => effectOf(config).maskWrongOn?.(category) === true);

/** A linter can be run only on a poll in a category it covers. */
export const canLint = (
	configs: readonly Config[],
	category: CategoryCode
): boolean => linterFor(configs, category) !== undefined;

export const stripConfig = (
	pipeline: Pipeline,
	configId: string
): Pipeline => ({
	...pipeline,
	configs: pipeline.configs.filter((config) => config.id !== configId),
});

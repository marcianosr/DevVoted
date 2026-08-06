import type { CategoryCode } from "~/domains/shared/categories";

import { Config } from "../configs/config.model";
import { AnswerContext, Coverage, effectOf } from "../configs/effect.model";
import {
	GATE_REWARD_KB,
	GATE_REWARD_MULTIPLIER_CAP,
	SLICE_WINDOW,
	gateBaseMultiplier,
	roundToOneDecimal,
} from "../rules.model";

export type Pipeline = {
	readonly id: string;
	readonly slots: number;
	readonly configs: readonly Config[];
};

export const BASE_SLOTS = 3;
export const MAX_SLOTS = 14;

const SLOT_COVERAGE_GATE: Readonly<Record<number, number>> = {
	4: 8,
	5: 16,
	6: 28,
	7: 45,
	8: 70,
	9: 100,
	10: 140,
	11: 190,
	12: 250,
	// Slots 13–14 continue the curve's own growth (deltas ~60 → ~75 → ~90).
	// Untuned by playtesting, unlike the rungs above them.
	13: 325,
	14: 415,
};

/** Total coverage needed to add the next slot; Infinity once the cap is reached. */
export const coverageToAddSlot = (currentSlots: number): number =>
	SLOT_COVERAGE_GATE[currentSlots + 1] ?? Infinity;

/** A slot can be added only below the cap and once its coverage gate is met. */
export const canAddSlot = (currentSlots: number, coverage: number): boolean =>
	currentSlots < MAX_SLOTS && coverage >= coverageToAddSlot(currentSlots);

/**
 * Every gate past the first is bought with a slot (ADR-018). Gates count from 0:
 * gate 0 runs on the starting width, and each later gate demands one more slot
 * than the one before, so gate 11 needs all 14. `VICTORY_GATE` is the far end of
 * this same relation (`MAX_SLOTS - BASE_SLOTS`).
 */
export const slotsRequiredForGate = (gate: number): number => gate + BASE_SLOTS;

/** Whether a pipeline of this width is wide enough to run the given gate. */
export const gateFitsPipeline = (gate: number, slots: number): boolean =>
	slots >= slotsRequiredForGate(gate);

export const isBare = (pipeline: Pipeline): boolean =>
	pipeline.configs.length === 0;

const effects = (configs: readonly Config[]) => configs.map(effectOf);

export const effectiveRequirement = (
	pipeline: Pipeline,
	base: number
): number => {
	const raised = effects(pipeline.configs).reduce(
		(total, effect) => total + (effect.requirementDelta ?? 0),
		0
	);
	return Math.max(1, base + raised);
};

// The modifier fns take bare configs, not a Pipeline: the configure screen
// prices a *previewed* loadout (equipped configs + hovered candidate) that has
// no Pipeline identity yet, and none of them ever read slots or id.
export const rewardMultiplierFor = (configs: readonly Config[]): number =>
	effects(configs).reduce(
		(product, effect) => product * (effect.rewardMultiplier ?? 1),
		1
	);

/** Flat KB paid on top of the gate reward when the gate clears (Unit Tests' +32). */
export const storageOnClearFor = (configs: readonly Config[]): number =>
	effects(configs).reduce(
		(total, effect) => total + (effect.storageOnClear ?? 0),
		0
	);

/** Build-wide coverage boost applied to every correct answer (Focus category bonuses excluded). */
export const coverageProfileFor = (
	configs: readonly Config[]
): { readonly mult: number; readonly add: number } =>
	configs.reduce(
		(profile, config) => ({
			mult: profile.mult * (config.coverageMultiplier ?? 1),
			add: profile.add + (config.coverageAdd ?? 0),
		}),
		{ mult: 1, add: 0 }
	);

export type PipelineModifiers = {
	readonly gateReward: number;
	readonly rewardMultiplier: number;
	readonly coverageMultiplier: number;
	readonly coverageAdd: number;
};

/**
 * Every surface that prices a loadout — the run viewmodel, the gate-clear
 * payout, and the configure screen's preview strip — derives from this one fn,
 * so a previewed pipeline is guaranteed to price exactly like an equipped one.
 */
export const pipelineModifiersFor = (
	configs: readonly Config[]
): PipelineModifiers => {
	const rewardMultiplier = rewardMultiplierFor(configs);
	const coverage = coverageProfileFor(configs);
	return {
		rewardMultiplier,
		coverageMultiplier: coverage.mult,
		coverageAdd: coverage.add,
		gateReward:
			Math.round(GATE_REWARD_KB * rewardMultiplier) +
			storageOnClearFor(configs),
	};
};

/**
 * Storage a cleared gate actually pays. The 32KB base rides the same
 * `gatesCleared + 1` curve as coverage (gate 1 tops out at 32, gate 5 at
 * 160) and scales with window correctness — a 0/5 clear pays nothing, so an
 * all-skip build climbs without earning anything to bank (ADR-017). Flat
 * clear payouts (Unit Tests' +32) stay whole: they ride on that config's
 * own passed check.
 */
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
	// Render flat-add chips first, then multiplier chips, so the equation reads
	// left-to-right the way the math composes: adds, then multipliers last. Adds
	// are already folded into the subtotal below, so this reorder changes only
	// display order — every chip value and the total stay identical.
	const orderedCovered = [
		...covered.filter((entry) => entry.cover.mult === 1),
		...covered.filter((entry) => entry.cover.mult !== 1),
	];
	// Subtotal the multipliers amplify: the base plus every flat add. Each
	// multiplier grows it in turn (mults compose last), so its chip reflects the
	// gain it produced over everything earned so far.
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

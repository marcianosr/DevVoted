import type { CategoryCode } from "~/shared/lib/categories";

import {
	Config,
	faucetKbPerCorrect,
	focusCoverageMultiplier,
} from "~/modules/run/config/domain/config.model";
import {
	AnswerContext,
	Coverage,
	effectOf,
} from "~/modules/run/config/domain/effect.model";
import {
	GATE_REWARD_KB,
	GATE_REWARD_MULTIPLIER_CAP,
	SLICE_WINDOW,
	gateBaseMultiplier,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";

export type Pipeline = {
	readonly id: string;
	readonly slots: number;
	readonly configs: readonly Config[];
};

export const BASE_SLOTS = 3;
export const MAX_SLOTS = 14;

/**
 * Gates grant slots (ADR-034): clears 1–11 open slots 4–14, so width supply
 * is deterministic and coverage — now the gate's own demand — is never priced
 * on two ladders at once. Callers widening a live pipeline take the max with
 * its current slots, so a run hydrated from the old coverage ladder never
 * shrinks.
 */
export const slotsForGatesCleared = (gatesCleared: number): number =>
	Math.min(MAX_SLOTS, BASE_SLOTS + Math.max(0, gatesCleared - 1));

/** The gate whose clear opens the pipeline's next slot; null at the cap. */
export const nextSlotGateFor = (currentSlots: number): number | null =>
	currentSlots >= MAX_SLOTS ? null : currentSlots - 2;

export type CoverageLap = {
	readonly lap: number;
	readonly name: "Line" | "Branch" | "Mutation" | "Fuzz";
	readonly remainder: number;
};

const LAP_NAMES = ["Line", "Branch", "Mutation", "Fuzz"] as const;

/**
 * Coverage reads in laps of 100% (ADR-034), each named a real rung of testing
 * rigor: "Branch 70%" is 170% total. The last name holds past 400%, where no
 * threshold reaches.
 */
export const coverageLapFor = (coverage: number): CoverageLap => {
	const lap = Math.min(LAP_NAMES.length, Math.floor(coverage / 100) + 1);
	return {
		lap,
		name: LAP_NAMES[lap - 1],
		remainder: roundToOneDecimal(coverage - (lap - 1) * 100),
	};
};

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
const storageOnClearFor = (configs: readonly Config[]): number =>
	effects(configs).reduce(
		(total, effect) => total + (effect.storageOnClear ?? 0),
		0
	);

/**
 * Interest a cleared gate pays on the balance you are already holding — the one
 * payout that is not a function of the loadout alone, which is why it stays out
 * of `pipelineModifiersFor` (a previewed loadout has no balance) and is applied
 * beside `gateClearPayout` by the reducer, the only place that knows the
 * post-bill balance. Rounded down: KB are whole, and the player should never
 * see interest they cannot spend.
 */
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

/**
 * `.length`'s clear payout: KB per correct answer the window held beyond one per
 * poll. Out of `pipelineModifiersFor` for the same reason interest is — the
 * loadout alone cannot price it, since the amount is a fact about the window
 * that was drawn. A window of five single-answer polls has no extra picks and
 * pays nothing, which is the config's honest dead spot; a multi-heavy window
 * pays well and was the hard one to count.
 *
 * No pass check needed: the reducer only calls this on a clear, and a clear
 * means every check passed, including `.length`'s own budget.
 */
export const extraPickPayoutFor = (
	configs: readonly Config[],
	extraPicks: number
): number =>
	configs.reduce(
		(total, config) =>
			total + (config.storagePerExtraPick ?? 0) * Math.max(0, extraPicks),
		0
	);

/** Build-wide coverage boost applied to every correct answer (Focus category bonuses excluded). */
const coverageProfileFor = (
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

export type PerAnswerPreview = {
	readonly coveragePerCorrect: number;
	readonly storageKbPerCorrect: number;
	/** The best Focus bonus in the build, called out separately since it only
	 * lands when a poll's category matches — absent with no Focus config equipped. */
	readonly matchingConfigMultiplier?: number;
};

/**
 * What one correct, average-difficulty answer is worth right now — the stake
 * receipt's "Per answer" line. `coverageProfileFor` deliberately excludes Focus
 * bonuses (they're conditional on the poll's category), so `coveragePerCorrect`
 * is the guaranteed floor; `matchingConfigMultiplier` is surfaced separately as
 * the best-case bonus a Focus config in the build can add. Only one category
 * can match a given poll, so the highest level stands in rather than summing
 * every Focus config's multiplier.
 */
export const perAnswerPreviewFor = (
	configs: readonly Config[],
	gatesCleared: number
): PerAnswerPreview => {
	const { mult, add } = coverageProfileFor(configs);
	const focusMultipliers = configs
		.filter((config) => config.focusCategory !== undefined)
		.map((config) => focusCoverageMultiplier(config.level ?? 1));
	return {
		coveragePerCorrect: roundToOneDecimal(
			gateBaseMultiplier(gatesCleared) * (1 + add) * mult
		),
		storageKbPerCorrect: faucetKbPerCorrect(configs),
		matchingConfigMultiplier:
			focusMultipliers.length > 0 ? Math.max(...focusMultipliers) : undefined,
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

/**
 * The equipped config that sells community splits, if any. Category-blind, which
 * is what separates it from `linterFor`: the split exists for every poll, so the
 * draw can never excuse the check it comes with.
 */
export const peekerFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.peeksCommunitySplit === true);

/** The equipped config counting the window's picks, if any (`.length`). */
export const budgeterFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.check === "pick-budget");

export const stripConfig = (
	pipeline: Pipeline,
	configId: string
): Pipeline => ({
	...pipeline,
	configs: pipeline.configs.filter((config) => config.id !== configId),
});

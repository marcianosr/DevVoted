import { wagererFor } from "~/modules/run/build/domain/build.model";
import {
	BASE_UNIT,
	type CoverageBreakdown,
	type CoverageConfigBonus,
	type CoverageFactors,
	creditFor,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	type Config,
	faucetKbPerCorrect,
	focusMultiplierOf,
} from "~/modules/run/config/domain/config.model";
import {
	type Coverage,
	type PayoutContext,
	effectOf,
} from "~/modules/run/config/domain/effect.model";
import {
	roundToTwoDecimals,
	streakMultiplier,
	streakUnitBonus,
} from "~/modules/run/run/domain/rules.model";
import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

export type AnswerPayout = {
	/** Units the answer banks: base, build, streak step and an armed wager's win. */
	readonly earned: number;
	readonly breakdown: CoverageBreakdown;
	readonly factors?: CoverageFactors;
};

type Covered = { readonly config: Config; readonly cover: Coverage };

const coveredBy = (
	configs: readonly Config[],
	context: PayoutContext,
	creditedUnits: number
): readonly Covered[] =>
	configs.flatMap((config) => {
		const cover = effectOf(config).coverage?.(context, creditedUnits);
		return cover === undefined ? [] : [{ config, cover }];
	});

const buildMultiplierOf = (covered: readonly Covered[]): number =>
	covered.reduce((product, { cover }) => product * cover.mult, 1);

const flatUnitsOf = (covered: readonly Covered[]): number =>
	covered.reduce((sum, { cover }) => sum + cover.add, 0);

type BonusWalk = {
	readonly rows: readonly CoverageConfigBonus[];
	readonly subtotal: number;
};

/**
 * Flat adds are listed first and credited at face value; each multiplier is
 * then credited on the running subtotal, so the rows add up to what was paid.
 */
const bonusRowsOf = (
	covered: readonly Covered[],
	creditedUnits: number,
	wagerer: Config | undefined,
	wagerUnits: number
): readonly CoverageConfigBonus[] => {
	const ordered = [
		...covered.filter(({ cover }) => cover.mult === 1),
		...covered.filter(({ cover }) => cover.mult !== 1),
	];
	const start: BonusWalk = { rows: [], subtotal: creditedUnits };
	const { rows } = ordered.reduce<BonusWalk>(
		({ rows, subtotal }, { config, cover }) =>
			cover.mult === 1
				? {
						rows: [
							...rows,
							{ configId: config.id, value: roundToTwoDecimals(cover.add) },
						],
						subtotal,
					}
				: {
						rows: [
							...rows,
							{
								configId: config.id,
								value: roundToTwoDecimals(subtotal * (cover.mult - 1)),
								factor: cover.mult,
							},
						],
						subtotal: subtotal * cover.mult,
					},
		start
	);
	const paid = rows.filter((row) => row.value !== 0);
	return wagerer === undefined
		? paid
		: [...paid, { configId: wagerer.id, value: wagerUnits }];
};

const NOTHING_PAID: CoverageBreakdown = {
	base: 0,
	streakBonus: 0,
	configBonuses: [],
};

/**
 * The one walk that prices a right answer. Everything that quotes or attributes
 * that price reads this result, so a preview can never disagree with a payout.
 */
export const answerPayoutFor = (
	configs: readonly Config[],
	context: PayoutContext,
	share: number,
	streakBefore = 0,
	wagerUnits = 0
): AnswerPayout => {
	if (share <= 0)
		return { earned: roundToTwoDecimals(wagerUnits), breakdown: NOTHING_PAID };

	const creditedUnits = BASE_UNIT * share * creditFor(context.answerType);
	const covered = coveredBy(configs, context, creditedUnits);
	const build = buildMultiplierOf(covered);
	const streakBonus = streakUnitBonus(streakBefore);
	const coverage = roundToTwoDecimals(
		creditedUnits * build + flatUnitsOf(covered) + streakBonus
	);
	const earned = roundToTwoDecimals(coverage + wagerUnits);
	const configBonuses = bonusRowsOf(
		covered,
		creditedUnits,
		wagerUnits === 0 ? undefined : wagererFor(configs),
		wagerUnits
	);
	const bonusTotal = configBonuses.reduce((sum, bonus) => sum + bonus.value, 0);

	return {
		earned,
		breakdown: {
			base: roundToTwoDecimals(earned - bonusTotal - streakBonus),
			streakBonus,
			configBonuses,
		},
		factors: { correct: share, build },
	};
};

export type PerAnswerPreview = {
	readonly coveragePerCorrect: number;
	readonly coveragePerWrong: number;
	readonly storageKbPerCorrect: number;
	readonly matchingConfigMultiplier?: number;
	readonly streakStepMultiplier: number;
};

/** What is known about the next answer before its poll is on screen. */
export type PreviewFacts = {
	readonly answeredBefore: number;
	readonly answerType?: AnswerType;
	readonly wagerUnits?: number;
};

export const previewContextFor = ({
	answeredBefore,
	answerType = "single",
}: PreviewFacts): PayoutContext => ({
	category: undefined,
	answerType,
	answeredBefore,
	cachedHits: 0,
	previouslyMissed: false,
});

export const perAnswerPreviewFor = (
	configs: readonly Config[],
	facts: PreviewFacts
): PerAnswerPreview => {
	const { wagerUnits = 0 } = facts;
	const focusMultipliers = configs
		.filter((config) => config.focusCategory !== undefined)
		.map(focusMultiplierOf);
	return {
		coveragePerCorrect: answerPayoutFor(configs, previewContextFor(facts), 1, 0)
			.earned,
		coveragePerWrong: wagerUnits === 0 ? 0 : -wagerUnits,
		storageKbPerCorrect: faucetKbPerCorrect(configs),
		matchingConfigMultiplier:
			focusMultipliers.length > 0 ? Math.max(...focusMultipliers) : undefined,
		streakStepMultiplier: streakMultiplier(1),
	};
};

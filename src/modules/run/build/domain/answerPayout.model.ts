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
import { roundToTwoDecimals } from "~/modules/run/run/domain/rules.model";
import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

export type AnswerPayout = {
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

const compoundedOf = (covered: readonly Covered[]): number =>
	covered.reduce((product, { cover }) => product * cover.mult, 1);

const pooledBoostOf = (covered: readonly Covered[]): number =>
	Math.max(
		0,
		covered.reduce((pool, { cover }) => pool + cover.boost - 1, 1)
	);

const buildMultiplierOf = (covered: readonly Covered[]): number =>
	compoundedOf(covered) * pooledBoostOf(covered);

const flatUnitsOf = (covered: readonly Covered[]): number =>
	covered.reduce((sum, { cover }) => sum + cover.add, 0);

const pooledShareOf = (covered: readonly Covered[], cover: Coverage): number => {
	const raw = covered.reduce((pool, entry) => pool + entry.cover.boost - 1, 0);
	const capped = pooledBoostOf(covered) - 1;
	return raw === 0 ? 0 : ((cover.boost - 1) * capped) / raw;
};

type BonusWalk = {
	readonly rows: readonly CoverageConfigBonus[];
	readonly subtotal: number;
};

const bonusRowsOf = (
	covered: readonly Covered[],
	creditedUnits: number,
	wagerer: Config | undefined,
	wagerUnits: number
): readonly CoverageConfigBonus[] => {
	const flatRows = covered
		.filter(({ cover }) => cover.add !== 0)
		.map(({ config, cover }) => ({
			configId: config.id,
			value: roundToTwoDecimals(cover.add),
		}));
	const start: BonusWalk = { rows: [], subtotal: creditedUnits };
	const compounded = covered
		.filter(({ cover }) => cover.mult !== 1)
		.reduce<BonusWalk>(
			({ rows, subtotal }, { config, cover }) => ({
				rows: [
					...rows,
					{
						configId: config.id,
						value: roundToTwoDecimals(subtotal * (cover.mult - 1)),
						factor: cover.mult,
					},
				],
				subtotal: subtotal * cover.mult,
			}),
			start
		);
	const pooledRows = covered
		.filter(({ cover }) => cover.boost !== 1)
		.map(({ config, cover }) => ({
			configId: config.id,
			value: roundToTwoDecimals(
				compounded.subtotal * pooledShareOf(covered, cover)
			),
			factor: cover.boost,
		}));
	const paid = [...flatRows, ...compounded.rows, ...pooledRows].filter(
		(row) => row.value !== 0
	);
	return wagerer === undefined
		? paid
		: [...paid, { configId: wagerer.id, value: wagerUnits }];
};

const NOTHING_PAID: CoverageBreakdown = {
	base: 0,
	configBonuses: [],
};

export const answerPayoutFor = (
	configs: readonly Config[],
	context: PayoutContext,
	share: number,
	wagerUnits = 0
): AnswerPayout => {
	if (share <= 0)
		return { earned: roundToTwoDecimals(wagerUnits), breakdown: NOTHING_PAID };

	const creditedUnits = BASE_UNIT * share * creditFor(context.answerType);
	const covered = coveredBy(configs, context, creditedUnits);
	const build = buildMultiplierOf(covered);
	const coverage = roundToTwoDecimals(
		creditedUnits * build + flatUnitsOf(covered)
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
			base: roundToTwoDecimals(earned - bonusTotal),
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
};

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
		coveragePerCorrect: answerPayoutFor(configs, previewContextFor(facts), 1)
			.earned,
		coveragePerWrong: wagerUnits === 0 ? 0 : -wagerUnits,
		storageKbPerCorrect: faucetKbPerCorrect(configs),
		matchingConfigMultiplier:
			focusMultipliers.length > 0 ? Math.max(...focusMultipliers) : undefined,
	};
};

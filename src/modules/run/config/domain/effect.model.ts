import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";
import type { CategoryCode } from "~/shared/lib/categories";

import {
	Config,
	cacheUnitsFor,
	focusMultiplierOf,
	interestPctOf,
	minifiedMultiplier,
	minifiedUnits,
	storageOnClearOf,
	topUpUnitsFor,
} from "~/modules/run/config/domain/config.model";

export type CategoryTally = {
	readonly seen: number;
	readonly correct: number;
};

export type GateWindow = {
	readonly correct: number;
	readonly answered: number;
	readonly unitsEarned: number;
	readonly byCategory: Readonly<Record<string, CategoryTally>>;
	readonly peeked?: number;
	readonly linted?: number;
	readonly budget?: number;
};

export const EMPTY_WINDOW: GateWindow = {
	correct: 0,
	answered: 0,
	unitsEarned: 0,
	byCategory: {},
	peeked: 0,
	linted: 0,
};

export type Coverage = { readonly mult: number; readonly add: number };

export type AnswerContext = {
	readonly category: CategoryCode;
	readonly answerType: AnswerType;
	readonly answeredBefore: number;
	readonly cachedHits: number;
	readonly previouslyMissed: boolean;
};

export type Effect = {
	rewardMultiplier?: number;
	storageOnClear?: number;
	storageInterestPct?: number;
	coverage?: (context: AnswerContext, creditedUnits?: number) => Coverage;
	maskWrongOn?: (category: CategoryCode) => boolean;
};

export const touchesCoverage = (config: Config): boolean =>
	config.focusCategory !== undefined ||
	config.missedPollMultiplier !== undefined ||
	config.coverageMultiplier !== undefined ||
	config.coverageAdd !== undefined ||
	config.openerCoverageMultiplier !== undefined ||
	config.throttleCoverageMultiplier !== undefined ||
	config.cacheHitStep !== undefined ||
	config.roundsPartialUnitsUp !== undefined;

/**
 * ADR-044 D5: a config's costs are never halved, so minifying may only soften a
 * factor that pays. Which of the opener and the throttle is the cost differs by
 * config — Overclock front-loads, Cold Start back-loads — so the side of 1 the
 * factor falls on decides, not which field carries it.
 */
const minifiedFactor = (config: Config, factor: number): number =>
	factor >= 1 ? minifiedMultiplier(config, factor) : factor;

const coverageOf = (config: Config): Effect["coverage"] => {
	if (!touchesCoverage(config)) return undefined;
	return (
		{ category, answeredBefore, cachedHits, previouslyMissed },
		creditedUnits = 0
	) => ({
		mult:
			(config.focusCategory === category ? focusMultiplierOf(config) : 1) *
			minifiedMultiplier(config, config.coverageMultiplier ?? 1) *
			(previouslyMissed
				? minifiedFactor(config, config.missedPollMultiplier ?? 1)
				: 1) *
			(answeredBefore === 0
				? minifiedFactor(config, config.openerCoverageMultiplier ?? 1)
				: minifiedFactor(config, config.throttleCoverageMultiplier ?? 1)),
		add:
			minifiedUnits(config, config.coverageAdd ?? 0) +
			cacheUnitsFor(config, cachedHits) +
			topUpUnitsFor(config, creditedUnits),
	});
};

const maskOf = (config: Config): Effect["maskWrongOn"] => {
	const categories = config.eliminatesWrongOptionsFor;
	if (!categories) return undefined;
	return (category) => categories.includes(category);
};

export const effectOf = (config: Config): Effect => ({
	coverage: coverageOf(config),
	maskWrongOn: maskOf(config),
	storageOnClear: storageOnClearOf(config),
	storageInterestPct:
		config.storageInterestPct === undefined ? undefined : interestPctOf(config),
	rewardMultiplier:
		config.rewardMultiplier === undefined || config.rewardMultiplier === 1
			? undefined
			: minifiedMultiplier(config, config.rewardMultiplier),
});

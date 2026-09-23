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
import { bumpInFor } from "~/modules/run/config/domain/autoUpgrade.model";

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

export type ConfigStatus =
	| {
			readonly kind: "online";
			readonly coverage?: Coverage;
			readonly bumpIn?: number;
			/** KB this config's open transaction is holding, unpaid and at risk. */
			readonly holdingKb?: number;
	  }
	| { readonly kind: "unknown" }
	| { readonly kind: "skipped"; readonly why: SkipReason }
	| { readonly kind: "offline"; readonly audit: string };

export type SkipReason =
	| {
			readonly kind: "otherCategories";
			readonly categories: readonly CategoryCode[];
	  }
	| { readonly kind: "openerOnly" }
	| { readonly kind: "missedOnly" }
	| { readonly kind: "cacheCold" }
	| { readonly kind: "paysAtGateClear" }
	| { readonly kind: "paysOnPeel" }
	| { readonly kind: "billsAtGateClear" }
	| { readonly kind: "inShop" }
	| { readonly kind: "inPrep" }
	| { readonly kind: "noAuditToSuppress" }
	| { readonly kind: "armedForFatal" }
	| { readonly kind: "runCapReached" }
	| { readonly kind: "selectAllOnly" }
	| { readonly kind: "paysOnPartial" }
	| { readonly kind: "notThisPoll" };

export type PollStatusContext = AnswerContext & {
	readonly suppressingAudit: boolean;
	readonly categoryHidden?: boolean;
	readonly answerTypeHidden?: boolean;
	readonly offlineAudit?: string;
	readonly faucetRemainingKb: number;
	readonly autoUpgradeProgress: number;
	readonly pendingKb: number;
};

const coverageOnPoll = (
	config: Config,
	context: PollStatusContext
): Coverage | undefined => {
	const coverage = effectOf(config).coverage?.(context);
	if (coverage === undefined) return undefined;
	return coverage.mult === 1 && coverage.add === 0 ? undefined : coverage;
};

const paysOnThisAnswer = (
	config: Config,
	context: PollStatusContext
): boolean =>
	(config.storagePerCorrect !== undefined && context.faucetRemainingKb > 0) ||
	(config.escrowPerCorrect !== undefined && context.faucetRemainingKb > 0) ||
	config.storagePerExtraPick !== undefined;

const sellsSomethingHere = (config: Config, category: CategoryCode): boolean =>
	config.peeksCommunitySplit === true ||
	config.projectsGateOutcome === true ||
	effectOf(config).maskWrongOn?.(category) === true;

const readsAnswerType = (config: Config): boolean =>
	config.roundsPartialUnitsUp === true;

const readsAhead = (config: Config): boolean =>
	config.revealsUpcomingCategories === true ||
	config.revealsCorrectCount === true;

const countsThisAnswer = (config: Config): boolean =>
	config.autoUpgradeAfterCorrect !== undefined ||
	config.streakStepGrowth !== undefined;

const wagersThisAnswer = (config: Config): boolean =>
	config.wagersAnswer !== undefined;

const isOnline = (
	config: Config,
	context: PollStatusContext,
	coverage: Coverage | undefined
): boolean =>
	coverage !== undefined ||
	paysOnThisAnswer(config, context) ||
	sellsSomethingHere(config, context.category) ||
	readsAhead(config) ||
	countsThisAnswer(config) ||
	wagersThisAnswer(config) ||
	(config.suppressesAudit === true && context.suppressingAudit);

const skipReasonFor = (
	config: Config,
	context: PollStatusContext
): SkipReason => {
	if (config.eliminatesWrongOptionsFor)
		return {
			kind: "otherCategories",
			categories: config.eliminatesWrongOptionsFor,
		};
	if (config.focusCategory)
		return { kind: "otherCategories", categories: [config.focusCategory] };
	if (config.missedPollMultiplier !== undefined) return { kind: "missedOnly" };
	if (config.openerCoverageMultiplier !== undefined)
		return { kind: "openerOnly" };
	if (config.cacheHitStep !== undefined) return { kind: "cacheCold" };
	if (config.subscriptionKb !== undefined) return { kind: "billsAtGateClear" };
	if (config.reordersGatePolls === true) return { kind: "inPrep" };
	if (
		config.offersFullRoster === true ||
		config.draftCostFactor !== undefined ||
		config.locksOffers === true
	)
		return { kind: "inShop" };
	if (config.refundsPeeledConfigs === true) return { kind: "paysOnPeel" };
	if (config.suppressesAudit === true) return { kind: "noAuditToSuppress" };
	if (config.catchesFatal === true) return { kind: "armedForFatal" };
	if (
		config.storageOnClear !== undefined ||
		config.storageInterestPct !== undefined ||
		config.coveragePerEstimate !== undefined
	)
		return { kind: "paysAtGateClear" };
	if (
		(config.storagePerCorrect !== undefined ||
			config.escrowPerCorrect !== undefined) &&
		context.faucetRemainingKb === 0
	)
		return { kind: "runCapReached" };
	if (config.roundsPartialUnitsUp === true)
		return context.answerType === "multiple"
			? { kind: "paysOnPartial" }
			: { kind: "selectAllOnly" };
	return { kind: "notThisPoll" };
};

export const configStatusFor = (
	config: Config,
	context: PollStatusContext
): ConfigStatus => {
	if (context.offlineAudit !== undefined)
		return { kind: "offline", audit: context.offlineAudit };
	if (context.categoryHidden === true) return { kind: "unknown" };
	if (context.answerTypeHidden === true && readsAnswerType(config))
		return { kind: "unknown" };

	const coverage = coverageOnPoll(config, context);
	if (!isOnline(config, context, coverage))
		return { kind: "skipped", why: skipReasonFor(config, context) };

	const bumpIn = bumpInFor(config, context.autoUpgradeProgress);
	// Only the config that escrows claims the figure, so a build holding two
	// faucets never shows the same KB twice.
	const holdingKb =
		config.escrowPerCorrect !== undefined && context.pendingKb > 0
			? context.pendingKb
			: undefined;

	return {
		kind: "online",
		...(coverage === undefined ? {} : { coverage }),
		...(bumpIn === undefined ? {} : { bumpIn }),
		...(holdingKb === undefined ? {} : { holdingKb }),
	};
};

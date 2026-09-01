import type { CategoryCode } from "~/shared/lib/categories";

import {
	Config,
	focusMultiplierOf,
	interestPctOf,
	minifiedAmount,
	minifiedMultiplier,
	storageOnClearOf,
} from "~/modules/run/config/domain/config.model";

export type CategoryTally = {
	readonly seen: number;
	readonly correct: number;
};

export type GateWindow = {
	readonly correct: number;
	readonly answered: number;
	readonly coverageGained: number;
	readonly byCategory: Readonly<Record<string, CategoryTally>>;
	readonly peeked?: number;
	readonly linted?: number;
	readonly budget?: number;
};

export const EMPTY_WINDOW: GateWindow = {
	correct: 0,
	answered: 0,
	coverageGained: 0,
	byCategory: {},
	peeked: 0,
	linted: 0,
};

export type Coverage = { readonly mult: number; readonly add: number };

export type AnswerContext = {
	readonly category: CategoryCode;
	readonly answeredBefore: number;
};

export type Effect = {
	rewardMultiplier?: number;
	streakCapSteps?: number;
	storageOnClear?: number;
	storageInterestPct?: number;
	coverage?: (context: AnswerContext) => Coverage;
	maskWrongOn?: (category: CategoryCode) => boolean;
};

export const touchesCoverage = (config: Config): boolean =>
	config.focusCategory !== undefined ||
	config.coverageMultiplier !== undefined ||
	config.coverageAdd !== undefined ||
	config.openerCoverageMultiplier !== undefined ||
	config.throttleCoverageMultiplier !== undefined;

const coverageOf = (config: Config): Effect["coverage"] => {
	if (!touchesCoverage(config)) return undefined;
	return ({ category, answeredBefore }) => ({
		mult:
			(config.focusCategory === category ? focusMultiplierOf(config) : 1) *
			minifiedMultiplier(config, config.coverageMultiplier ?? 1) *
			(answeredBefore === 0
				? minifiedMultiplier(config, config.openerCoverageMultiplier ?? 1)
				: (config.throttleCoverageMultiplier ?? 1)),
		add: minifiedAmount(config, config.coverageAdd ?? 0),
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
		config.rewardMultiplier === 1
			? undefined
			: minifiedMultiplier(config, config.rewardMultiplier),
	streakCapSteps:
		config.streakCapSteps === undefined
			? undefined
			: minifiedAmount(config, config.streakCapSteps),
});

export type ConfigStatus =
	| { readonly kind: "online" }
	| { readonly kind: "unknown" }
	| { readonly kind: "skipped"; readonly why: SkipReason }
	| { readonly kind: "offline"; readonly audit: string };

export type SkipReason =
	| {
			readonly kind: "otherCategories";
			readonly categories: readonly CategoryCode[];
	  }
	| { readonly kind: "openerOnly" }
	| { readonly kind: "paysAtGateClear" }
	| { readonly kind: "billsAtGateClear" }
	| { readonly kind: "inShop" }
	| { readonly kind: "noAuditToSuppress" }
	| { readonly kind: "runCapReached" }
	| { readonly kind: "notThisPoll" };

export type PollStatusContext = AnswerContext & {
	readonly suppressingAudit: boolean;
	readonly categoryHidden?: boolean;
	readonly offlineAudit?: string;
	readonly faucetRemainingKb: number;
};

const changesCoverage = (
	config: Config,
	context: PollStatusContext
): boolean => {
	const coverage = effectOf(config).coverage?.(context);
	return coverage !== undefined && (coverage.mult !== 1 || coverage.add !== 0);
};

const paysOnThisAnswer = (
	config: Config,
	context: PollStatusContext
): boolean =>
	(config.storagePerCorrect !== undefined && context.faucetRemainingKb > 0) ||
	config.storagePerExtraPick !== undefined;

const sellsSomethingHere = (config: Config, category: CategoryCode): boolean =>
	config.peeksCommunitySplit === true ||
	effectOf(config).maskWrongOn?.(category) === true;

const readsAhead = (config: Config): boolean =>
	config.revealsUpcomingCategories === true ||
	config.revealsCorrectCount === true;

const isOnline = (config: Config, context: PollStatusContext): boolean =>
	changesCoverage(config, context) ||
	paysOnThisAnswer(config, context) ||
	sellsSomethingHere(config, context.category) ||
	readsAhead(config) ||
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
	if (config.openerCoverageMultiplier !== undefined)
		return { kind: "openerOnly" };
	if (config.subscriptionKb !== undefined) return { kind: "billsAtGateClear" };
	if (config.offersFullRoster === true || config.draftCostFactor !== undefined)
		return { kind: "inShop" };
	if (config.suppressesAudit === true) return { kind: "noAuditToSuppress" };
	if (
		config.storageOnClear !== undefined ||
		config.storageInterestPct !== undefined ||
		config.autoUpgradeOneIn !== undefined
	)
		return { kind: "paysAtGateClear" };
	if (config.storagePerCorrect !== undefined && context.faucetRemainingKb === 0)
		return { kind: "runCapReached" };
	return { kind: "notThisPoll" };
};

export const configStatusFor = (
	config: Config,
	context: PollStatusContext
): ConfigStatus => {
	if (context.offlineAudit !== undefined)
		return { kind: "offline", audit: context.offlineAudit };
	if (context.categoryHidden === true) return { kind: "unknown" };
	if (isOnline(config, context)) return { kind: "online" };
	return { kind: "skipped", why: skipReasonFor(config, context) };
};

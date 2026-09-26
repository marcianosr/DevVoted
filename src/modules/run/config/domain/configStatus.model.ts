import type { CategoryCode } from "~/shared/lib/categories";

import { chainKbFor, Config } from "~/modules/run/config/domain/config.model";
import { bumpInFor } from "~/modules/run/config/domain/autoUpgrade.model";
import {
	type AnswerContext,
	type Coverage,
	effectOf,
} from "~/modules/run/config/domain/effect.model";

export type ConfigStatus =
	| {
			readonly kind: "online";
			readonly coverage?: Coverage;
			readonly bumpIn?: number;
			readonly nextLinkKb?: number;
			readonly holdingKb?: number;
			readonly capLeftKb?: number;
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
	readonly chainLength: number;
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

const drawsOnFaucet = (config: Config): boolean =>
	config.storagePerCorrect !== undefined ||
	config.escrowPerCorrect !== undefined ||
	config.chainStartKb !== undefined;

const paysOnThisAnswer = (
	config: Config,
	context: PollStatusContext
): boolean =>
	(drawsOnFaucet(config) && context.faucetRemainingKb > 0) ||
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
	config.autoUpgradeAfterCorrect !== undefined;

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

const SKIP_REASONS: readonly ((
	config: Config,
	context: PollStatusContext
) => SkipReason | undefined)[] = [
	(config) =>
		config.eliminatesWrongOptionsFor && {
			kind: "otherCategories",
			categories: config.eliminatesWrongOptionsFor,
		},
	(config) =>
		config.focusCategory && {
			kind: "otherCategories",
			categories: [config.focusCategory],
		},
	(config) =>
		config.missedPollMultiplier !== undefined
			? { kind: "missedOnly" }
			: undefined,
	(config) =>
		config.openerCoverageMultiplier !== undefined
			? { kind: "openerOnly" }
			: undefined,
	(config) =>
		config.cacheHitStep !== undefined ? { kind: "cacheCold" } : undefined,
	(config) =>
		config.subscriptionKb !== undefined
			? { kind: "billsAtGateClear" }
			: undefined,
	(config) =>
		config.reordersGatePolls === true ? { kind: "inPrep" } : undefined,
	(config) =>
		config.offersFullRoster === true ||
		config.draftCostFactor !== undefined ||
		config.locksOffers === true
			? { kind: "inShop" }
			: undefined,
	(config) =>
		config.refundsPeeledConfigs === true ? { kind: "paysOnPeel" } : undefined,
	(config) =>
		config.suppressesAudit === true ? { kind: "noAuditToSuppress" } : undefined,
	(config) =>
		config.catchesFatal === true ? { kind: "armedForFatal" } : undefined,
	(config) =>
		config.storageOnClear !== undefined ||
		config.storageInterestPct !== undefined ||
		config.emptySlotDiscountKb !== undefined ||
		config.coveragePerEstimate !== undefined
			? { kind: "paysAtGateClear" }
			: undefined,
	(config, context) =>
		drawsOnFaucet(config) && context.faucetRemainingKb === 0
			? { kind: "runCapReached" }
			: undefined,
	(config, context) =>
		config.roundsPartialUnitsUp === true
			? context.answerType === "multiple"
				? { kind: "paysOnPartial" }
				: { kind: "selectAllOnly" }
			: undefined,
];

const skipReasonFor = (
	config: Config,
	context: PollStatusContext
): SkipReason => {
	for (const reasonFor of SKIP_REASONS) {
		const reason = reasonFor(config, context);
		if (reason) return reason;
	}
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
	const nextLinkKb =
		config.chainStartKb === undefined
			? undefined
			: chainKbFor([config], context.chainLength + 1);
	const holdingKb =
		config.escrowPerCorrect !== undefined && context.pendingKb > 0
			? context.pendingKb
			: undefined;

	return {
		kind: "online",
		...(coverage === undefined ? {} : { coverage }),
		...(bumpIn === undefined ? {} : { bumpIn }),
		...(nextLinkKb === undefined ? {} : { nextLinkKb }),
		...(holdingKb === undefined ? {} : { holdingKb }),
		...(drawsOnFaucet(config) ? { capLeftKb: context.faucetRemainingKb } : {}),
	};
};

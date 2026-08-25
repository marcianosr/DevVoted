import type { CategoryCode } from "~/shared/lib/categories";

import {
	Config,
	focusCoverageMultiplier,
} from "~/modules/run/config/domain/config.model";

export type CategoryTally = {
	readonly seen: number;
	readonly correct: number;
};

export type GateWindow = {
	readonly correct: number;
	readonly answered: number;
	/** The gate's score meter (ADR-035): coverage earned minus losses this
	 * attempt, floored at 0. Resets with the window, so every attempt at a gate
	 * is graded fresh. */
	readonly coverageGained: number;
	readonly byCategory: Readonly<Record<string, CategoryTally>>;
	/** Peeks bought this window. Doubles as the fee ladder's position, which is why
	 * the ladder resets with the window. Optional: legacy snapshots. */
	readonly peeked?: number;
	/** Correct options across this window's polls, recomputed on load because a day
	 * rollover (ADR-011) swaps the window's unplayed polls for tomorrow's. Prices
	 * `.length`'s clear payout and its "this gate holds N answers" line. Absent on
	 * legacy snapshots, and 0 is impossible for a real window (every poll has at
	 * least one correct option), so a falsy budget means "unknown". */
	readonly budget?: number;
};

export const EMPTY_WINDOW: GateWindow = {
	correct: 0,
	answered: 0,
	coverageGained: 0,
	byCategory: {},
	peeked: 0,
};

export type Coverage = { readonly mult: number; readonly add: number };

export type AnswerContext = {
	readonly category: CategoryCode;
	/** Polls already answered in this window — 0 marks the window's opener. */
	readonly answeredBefore: number;
};

export type Effect = {
	rewardMultiplier?: number;
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
	const level = config.level ?? 1;
	return ({ category, answeredBefore }) => ({
		mult:
			(config.focusCategory === category ? focusCoverageMultiplier(level) : 1) *
			(config.coverageMultiplier ?? 1) *
			(answeredBefore === 0
				? (config.openerCoverageMultiplier ?? 1)
				: (config.throttleCoverageMultiplier ?? 1)),
		add: config.coverageAdd ?? 0,
	});
};

const maskOf = (config: Config): Effect["maskWrongOn"] => {
	const categories = config.eliminatesWrongOptionsFor;
	if (!categories) return undefined;
	return (category) => categories.includes(category);
};

// Configs are pure enhancements (ADR-035): an effect is derived from the
// benefit fields alone. The gate's friction lives on the gate itself.
export const effectOf = (config: Config): Effect => ({
	coverage: coverageOf(config),
	maskWrongOn: maskOf(config),
	// Flat clear payouts scale with level: Unit Tests pays +32KB × level.
	storageOnClear:
		config.storageOnClear === undefined
			? undefined
			: config.storageOnClear * (config.level ?? 1),
	storageInterestPct:
		config.storageInterestPct === undefined
			? undefined
			: config.storageInterestPct * (config.level ?? 1),
	rewardMultiplier:
		config.rewardMultiplier === 1 ? undefined : config.rewardMultiplier,
});

/**
 * Where a config stands on the poll on deck. Configs stopped passing and failing
 * when ADR-035 deleted their checks; these are the three states one can actually
 * be in, and the rail says them in these words.
 */
export type ConfigStatus =
	| { readonly kind: "online" }
	| { readonly kind: "skipped"; readonly why: SkipReason }
	| { readonly kind: "offline"; readonly audit: string };

/** Why a skipped config sits this poll out, reduced to the fact it is built from
 * rather than a sentence — the row writes the copy, as with `GateRowReason`. */
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
	/** Volkswagen CI suppresses nothing at the clean gates, so whether it is
	 * working is a fact about the gate rather than about the config. */
	readonly suppressingAudit: boolean;
	/** The audit holding this config down, when one is. */
	readonly offlineAudit?: string;
	/** What the run's storage faucet may still pay. A faucet with nothing left
	 * is not paying on this answer, whatever its rate says. */
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

/** Reading the run ahead is live work, even though the number it moves is not on
 * this poll: the reveal is on screen while the player answers. */
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
	// Before the shop reason: Freemium discounts drafts and bills at the clear,
	// and the bill is the half a player forgets.
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
	if (isOnline(config, context)) return { kind: "online" };
	return { kind: "skipped", why: skipReasonFor(config, context) };
};

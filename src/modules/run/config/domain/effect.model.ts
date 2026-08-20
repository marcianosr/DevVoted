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

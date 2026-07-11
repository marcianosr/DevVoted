import type { CategoryCode } from "~/domains/shared/categories";
import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage.model";

/**
 * Coverage % between earned snippets. A snippet is earned each time a category's
 * coverage crosses another multiple of this within a run.
 *
 * Prototype value is deliberately low so snippets appear during a short play
 * session. Tune this to change the earning cadence.
 */
export const SNIPPET_MILESTONE_STEP = 25;

/**
 * Total snippets earned so far this run from coverage milestones.
 *
 * Model A, corrected: you earn a snippet by *gaining* coverage (progress), not
 * by being weak in a category. Each category that crosses another
 * SNIPPET_MILESTONE_STEP hands you one snippet.
 *
 * This starter rule is your tuning knob — the whole "feel" of the system lives
 * here. Decisions worth playing with:
 *   - SNIPPET_MILESTONE_STEP — how often earning happens
 *   - clamp per category at 100% (below it keeps paying out in post-victory
 *     levels; add `Math.min(cov, 100)` to cap it)
 * Example with step 25: a category at 62% has crossed 25 and 50 → 2 snippets.
 */
export const countEarnedSnippets = (
	categoryCoverage: RunCategoryCoverage[]
): number =>
	categoryCoverage.reduce(
		(total, category) =>
			total +
			Math.floor(
				Math.max(0, category.currentCoverage) / SNIPPET_MILESTONE_STEP
			),
		0
	);

export type NextSnippetProgress = {
	/** Category closest to earning the next snippet, or null if no coverage yet. */
	categoryCode: CategoryCode | null;
	/** Coverage % still needed in that category to earn the next snippet. */
	toGo: number;
	/** 0–100: how far into the current milestone the closest category is. */
	pct: number;
};

/**
 * Progress toward the next earned snippet: the category nearest its next
 * milestone. Drives the "X% to next snippet" readout in the poll UI.
 */
export const nextSnippetProgress = (
	categoryCoverage: RunCategoryCoverage[]
): NextSnippetProgress => {
	const toNextMilestone = (coverage: number): number => {
		const clamped = Math.max(0, coverage);
		return SNIPPET_MILESTONE_STEP - (clamped % SNIPPET_MILESTONE_STEP);
	};

	const closest = categoryCoverage.reduce<NextSnippetProgress | null>(
		(best, category) => {
			const toGo = toNextMilestone(category.currentCoverage);
			if (best && best.toGo <= toGo) return best;
			return {
				categoryCode: category.categoryCode,
				toGo,
				pct: ((SNIPPET_MILESTONE_STEP - toGo) / SNIPPET_MILESTONE_STEP) * 100,
			};
		},
		null
	);

	return (
		closest ?? { categoryCode: null, toGo: SNIPPET_MILESTONE_STEP, pct: 0 }
	);
};

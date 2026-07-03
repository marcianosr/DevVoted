import type { PipelineSlotRequirement } from "~/domains/runs/models/pipeline.model";
import type { PipelineEvaluationContext } from "~/domains/runs/services/pipelineEvaluator.service";

/**
 * The numeric progress of a single pipeline check toward its requirement, for a
 * given window context. This is the animatable counterpart to
 * `formatCurrentStat` (which renders the same facts as a string): callers tween
 * `current` (and the bar width `current/target`) from a previous context to the
 * new one to juice the /pipelines score view.
 *
 * `seen` is only meaningful for category-mastery — false when no poll of the
 * category appeared in the window, i.e. the check is currently skipped and has
 * nothing to animate.
 */
export type SlotProgress = {
	current: number;
	target: number;
	suffix: string;
	seen: boolean;
};

export const getSlotProgress = (
	req: PipelineSlotRequirement,
	ctx: PipelineEvaluationContext
): SlotProgress => {
	switch (req.type) {
		case "correct-answers":
			return {
				current: ctx.correctAnswersInWindow,
				target: req.count,
				suffix: "correct",
				seen: true,
			};
		case "coverage-gain":
			return {
				current: ctx.coverageGainedInWindow,
				target: req.threshold,
				suffix: "%",
				seen: true,
			};
		case "short-window":
			return {
				current: ctx.pollsAnsweredInWindow,
				target: req.pollCount,
				suffix: "answered",
				seen: true,
			};
		case "cold-start":
			return {
				current: ctx.firstConsecutiveCorrectFromWindowStart,
				target: req.count,
				suffix: "correct start",
				seen: true,
			};
		case "category-mastery": {
			const results = ctx.categoryPollResults?.[req.category];
			const appeared = results?.appeared ?? 0;
			// Critical (minCorrect=null) means "all that appear must be correct", so
			// the target is how many appeared. Otherwise show against the fixed
			// threshold so the player sees how many more they still need.
			const target = req.minCorrect === null ? appeared : req.minCorrect;
			return {
				current: results?.correct ?? 0,
				target,
				suffix: "correct",
				seen: appeared > 0,
			};
		}
	}
};

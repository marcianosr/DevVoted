import type { PipelineSlotRequirement } from "~/domains/runs/models/pipeline.model";
import type { PipelineEvaluationContext } from "~/domains/runs/services/pipelineEvaluator.service";

export const formatCurrentStat = (
	req: PipelineSlotRequirement,
	ctx: PipelineEvaluationContext
): string => {
	switch (req.type) {
		case "correct-answers":
			return `${ctx.correctAnswersInWindow}/${req.count} correct`;
		case "coverage-gain": {
			const val = ctx.coverageGainedInWindow.toFixed(1);
			const gained = ctx.coverageGainedInWindow >= 0 ? `+${val}%` : `${val}%`;
			return `${gained} of ${req.threshold}% needed`;
		}
		case "short-window":
			return `${ctx.pollsAnsweredInWindow}/${req.pollCount} answered`;
		case "cold-start":
			return `${ctx.firstConsecutiveCorrectFromWindowStart}/${req.count} correct start`;
		case "category-mastery": {
			const results = ctx.categoryPollResults?.[req.category];
			if (!results || results.appeared === 0) return "no polls seen yet";
			// Critical (minCorrect=null) means "all that appear must be correct" —
			// show against appeared. Otherwise show against the real threshold so the
			// player sees how many more they still need.
			if (req.minCorrect === null)
				return `${results.correct}/${results.appeared} correct`;
			return `${results.correct}/${req.minCorrect} correct`;
		}
	}
};

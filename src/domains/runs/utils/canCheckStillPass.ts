import type { PipelineSlotRequirement } from "~/domains/runs/models/pipeline.model";
import type { PipelineEvaluationContext } from "~/domains/runs/services/pipelineEvaluator.service";

/**
 * Whether a pipeline check can still pass its gate given the current window
 * state — i.e. the best remaining outcome would clear the requirement. This is
 * the live counterpart to `evaluateSlot` (which grades the final window): the UI
 * uses it to warn the player that a check is already lost before the gate is
 * reached, instead of showing it as hopefully in-progress.
 *
 * Only requirements whose failure is *locked in* return false. Coverage gains
 * and numeric category targets depend on unpredictable future polls, so they
 * stay "still possible" to avoid false alarms (a missed warning is safer than a
 * wrong one).
 */
export const canCheckStillPass = (
	req: PipelineSlotRequirement,
	ctx: PipelineEvaluationContext
): boolean => {
	const remaining = ctx.pollsInWindow - ctx.pollsAnsweredInWindow;

	switch (req.type) {
		// Future correct answers can still add coverage — never locked out.
		case "coverage-gain":
			return true;

		// Streak requirement is ignored here: if the raw count is reachable we
		// don't warn, even when the streak may already be impossible (missed
		// warning over false alarm).
		case "correct-answers":
			return ctx.correctAnswersInWindow + remaining >= req.count;

		case "short-window":
			if (!req.correctRequired) return true;
			return ctx.correctAnswersInWindow + remaining >= req.correctRequired;

		case "cold-start": {
			// The leading correct run freezes the moment it breaks (it drops below
			// the count of polls answered). Once frozen under the target it can never
			// recover; while still unbroken there's room to reach the target.
			const streakBroken =
				ctx.firstConsecutiveCorrectFromWindowStart < ctx.pollsAnsweredInWindow;
			if (!streakBroken) return true;
			return ctx.firstConsecutiveCorrectFromWindowStart >= req.count;
		}

		case "category-mastery": {
			// Critical (all appearing polls must be correct): a single wrong answer
			// on a poll that already appeared is fatal. Numeric targets depend on how
			// many category polls still appear, which is unknowable — don't warn.
			if (req.minCorrect !== null) return true;
			const results = ctx.categoryPollResults?.[req.category];
			const appeared = results?.appeared ?? 0;
			const correct = results?.correct ?? 0;
			return correct >= appeared;
		}
	}
};

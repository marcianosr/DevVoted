import type { PipelineSlot } from "~/domains/runs/models/pipeline.model";
import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage.model";
import type { PipelineEvaluationContext } from "~/domains/runs/services/pipelineEvaluator.service";
import { CATEGORY_METADATA } from "~/domains/shared/categories";
import { RunJeopardy as RunJeopardyUI } from "~/ui/runs/RunJeopardy.ui";
import type { RunJeopardyStreak } from "~/ui/runs/RunJeopardy.ui";

type RunJeopardyProps = {
	windowContext: PipelineEvaluationContext | null;
	categoryCoverage: RunCategoryCoverage[];
	pipelineSlots: PipelineSlot[];
	countdownLabel: string;
};

// A 1× "streak" isn't worth loss-aversion framing — only surface one the player
// has actually built up and would feel losing.
const MIN_STREAK_TO_SHOW = 2;

const strongestStreak = (
	coverage: RunCategoryCoverage[]
): RunJeopardyStreak | null =>
	coverage.reduce<RunJeopardyStreak | null>((best, category) => {
		if (category.currentStreak < MIN_STREAK_TO_SHOW) return best;
		if (best && best.streak >= category.currentStreak) return best;
		return {
			categoryName: CATEGORY_METADATA[category.categoryCode].name,
			streak: category.currentStreak,
		};
	}, null);

export const RunJeopardy = ({
	windowContext,
	categoryCoverage,
	pipelineSlots,
	countdownLabel,
}: RunJeopardyProps) => {
	if (!windowContext || pipelineSlots.length === 0) return null;

	return (
		<RunJeopardyUI
			gate={windowContext.currentGate + 1}
			pollsUntilGate={
				windowContext.pollsInWindow - windowContext.pollsAnsweredInWindow
			}
			checkCount={pipelineSlots.length}
			topStreak={strongestStreak(categoryCoverage)}
			countdownLabel={countdownLabel}
		/>
	);
};

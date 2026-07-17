import type { PipelineSlot } from "~/domains/runs/models/pipeline.model";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";
import { canCheckStillPass } from "~/domains/runs/utils/canCheckStillPass";
import { DIFFICULTY_CLASSES } from "~/ui/runs/difficultyStyles";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";
import { getSlotProgress } from "~/domains/runs/utils/getSlotProgress";
import { CATEGORY_METADATA } from "~/domains/shared/categories";
import { CurrentPipeline as CurrentPipelineUI } from "~/ui/runs/CurrentPipeline.ui";
import type {
	PipelineCheckProgress,
	PipelineCheckRow,
	PipelineCheckStatus,
} from "~/ui/runs/CurrentPipeline.ui";

type CurrentPipelineProps = {
	slots: PipelineSlot[];
	/** Current window state; enables the per-check progress bars. */
	current?: PipelineEvaluationContext;
	/** State before the last answer; drives the previous→new bar animation. */
	previous?: PipelineEvaluationContext;
	/** A graded gate result; switches the block to grouped pass/fail display. */
	evaluation?: PipelineEvaluation;
	/** Show the gate number + polls-left in the block header. Off when a page
	 * header already surfaces the window status (the /pipelines screen). */
	showWindowStatus?: boolean;
};

// A category-mastery check is about one category, so name it after that
// category rather than the generic gate-type label.
const slotLabel = (slot: PipelineSlot): string =>
	slot.requirement.type === "category-mastery"
		? `${CATEGORY_METADATA[slot.requirement.category].name} mastery`
		: getSlotLabel(slot.gateTypeId);

const liveStatus = (
	slot: PipelineSlot,
	current?: PipelineEvaluationContext
): PipelineCheckStatus => {
	if (current && slot.requirement.type === "category-mastery") {
		const results = current.categoryPollResults?.[slot.requirement.category];
		if (!results || results.appeared === 0) return "skipped";
	}
	return "in-progress";
};

const slotProgress = (
	slot: PipelineSlot,
	current?: PipelineEvaluationContext,
	previous?: PipelineEvaluationContext
): PipelineCheckProgress | undefined => {
	if (!current) return undefined;
	const after = getSlotProgress(slot.requirement, current);
	const before = previous ? getSlotProgress(slot.requirement, previous) : after;
	return {
		previous: before.current,
		current: after.current,
		target: after.target,
		suffix: after.suffix,
		seen: after.seen,
	};
};

const LOST_CHECK_WARNING = "This pipeline can no longer pass this gate";

type CheckState = Pick<PipelineCheckRow, "status" | "progress" | "warning">;

// A graded gate takes its status straight from the evaluation. A live window
// shows in-progress, unless the check is already unwinnable — then it reads as
// failed with a warning so the player isn't chasing a lost gate.
const checkState = (
	slot: PipelineSlot,
	index: number,
	current?: PipelineEvaluationContext,
	previous?: PipelineEvaluationContext,
	evaluation?: PipelineEvaluation
): CheckState => {
	if (evaluation) {
		return {
			status: evaluation.slotEvaluations[index]?.status ?? "skipped",
			progress: slotProgress(slot, current, previous),
		};
	}

	const status = liveStatus(slot, current);
	if (
		status !== "skipped" &&
		current &&
		!canCheckStillPass(slot.requirement, current)
	) {
		return { status: "failed", warning: LOST_CHECK_WARNING };
	}

	return { status, progress: slotProgress(slot, current, previous) };
};

export const CurrentPipeline = ({
	slots,
	current,
	previous,
	evaluation,
	showWindowStatus = true,
}: CurrentPipelineProps) => {
	const rows: PipelineCheckRow[] = slots.map((slot, index) => ({
		label: slotLabel(slot),
		difficultyClassName: DIFFICULTY_CLASSES[slot.difficulty],
		difficulty: slot.difficulty,
		requirement: formatRequirement(slot.requirement),
		reward: slot.reward,
		...checkState(slot, index, current, previous, evaluation),
	}));

	const totalReward = evaluation
		? undefined
		: slots.reduce((sum, slot) => sum + slot.reward, 0);

	const clearedReward =
		evaluation?.passed && evaluation.totalReward > 0
			? evaluation.totalReward
			: undefined;

	return (
		<CurrentPipelineUI
			rows={rows}
			gate={showWindowStatus ? current?.currentGate : undefined}
			pollsLeft={
				showWindowStatus && current
					? current.pollsInWindow - current.pollsAnsweredInWindow
					: undefined
			}
			totalReward={totalReward}
			clearedReward={clearedReward}
			showGroupHeaders={evaluation !== undefined}
		/>
	);
};

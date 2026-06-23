import type { PipelineSlot } from "~/domains/runs/models/pipeline.model";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
	SlotEvaluationStatus,
} from "~/domains/runs/services/pipelineEvaluator.service";
import { formatCurrentStat } from "~/domains/runs/utils/formatCurrentStat";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";
import { formatStorage } from "~/lib/storage";
import {
	CurrentPipelineUI,
	type CurrentPipelineSlot,
} from "~/ui/runs/PipelineUpgrade.ui";
import type { SlotStatus } from "~/ui/runs/pipelineStyles";

type StatusWithInProgress = SlotEvaluationStatus | "in-progress";

const getLiveStatus = (
	slot: PipelineSlot,
	ctx?: PipelineEvaluationContext
): StatusWithInProgress => {
	if (!ctx) return "in-progress";
	if (slot.requirement.type === "category-mastery") {
		const results = ctx.categoryPollResults?.[slot.requirement.category];
		if (!results || results.appeared === 0) return "skipped";
	}
	return "in-progress";
};

export const toCurrentPipelineSlots = (
	slots: PipelineSlot[],
	evaluationContext?: PipelineEvaluationContext,
	evaluation?: PipelineEvaluation
): CurrentPipelineSlot[] =>
	slots.map((slot, i) => {
		const status = evaluation
			? ((evaluation.slotEvaluations[i]?.status ?? "in-progress") as SlotStatus)
			: getLiveStatus(slot, evaluationContext);
		return {
			id: `${slot.gateTypeId}-${i}`,
			status,
			label: getSlotLabel(slot.gateTypeId),
			difficulty: slot.difficulty,
			requirement: formatRequirement(slot.requirement),
			reward: `+${formatStorage(slot.reward)}`,
			currentStat:
				status === "in-progress" && evaluationContext
					? formatCurrentStat(slot.requirement, evaluationContext)
					: undefined,
		};
	});

export const CurrentPipeline = ({
	slots,
	evaluationContext,
	evaluation,
}: {
	slots: PipelineSlot[];
	evaluationContext?: PipelineEvaluationContext;
	evaluation?: PipelineEvaluation;
}) => {
	const totalPotentialReward = slots.reduce((sum, s) => sum + s.reward, 0);

	return (
		<CurrentPipelineUI
			gateNumber={evaluationContext?.currentGate}
			pollsLeft={
				evaluationContext
					? evaluationContext.pollsInWindow -
						evaluationContext.pollsAnsweredInWindow
					: undefined
			}
			totalPotentialReward={
				!evaluation && totalPotentialReward > 0
					? `+${formatStorage(totalPotentialReward)}`
					: undefined
			}
			evaluation={
				evaluation
					? {
							passed: evaluation.passed,
							totalReward: `+${formatStorage(evaluation.totalReward)}`,
						}
					: undefined
			}
			slots={toCurrentPipelineSlots(slots, evaluationContext, evaluation)}
		/>
	);
};

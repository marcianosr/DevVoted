import type { PipelineSlot } from "~/domains/runs/models/pipeline.model";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
	SlotEvaluationStatus,
} from "~/domains/runs/services/pipelineEvaluator.service";
import { formatCurrentStat } from "~/domains/runs/utils/formatCurrentStat";
import { DIFFICULTY_CLASSES } from "~/domains/runs/utils/difficultyStyles";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";

type StatusWithInProgress = SlotEvaluationStatus | "in-progress";

const STATUS_ICON: Record<StatusWithInProgress, React.ReactNode> = {
	"in-progress": (
		<span className="inline-block w-3 h-3 rounded-full bg-yellow-400 animate-pulse shrink-0 mt-1" />
	),
	passed: <span className="text-green-400 shrink-0">✓</span>,
	failed: <span className="text-red-400 shrink-0">✗</span>,
	skipped: (
		<span className="inline-block w-3 h-3 rounded-full bg-gray-400 shrink-0 mt-1" />
	),
};

const STATUS_LABEL: Record<StatusWithInProgress, React.ReactNode> = {
	"in-progress": <span className="text-yellow-400">in progress</span>,
	passed: <span className="text-green-400">passed</span>,
	failed: <span className="text-red-400">failed</span>,
	skipped: <span className="text-zinc-500">skipped</span>,
};

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

type GateHealthProps = {
	slots: PipelineSlot[];
	evaluationContext: PipelineEvaluationContext;
	evaluation?: PipelineEvaluation;
};

export const GateHealth = ({
	slots,
	evaluationContext,
	evaluation,
}: GateHealthProps) => {
	const { currentGate, pollsInWindow, pollsAnsweredInWindow } =
		evaluationContext;
	const pollsLeft = pollsInWindow - pollsAnsweredInWindow;

	const slotsWithStatus = slots.map((slot, i) => ({
		slot,
		status: evaluation
			? ((evaluation.slotEvaluations[i]?.status ??
					"in-progress") as StatusWithInProgress)
			: getLiveStatus(slot, evaluationContext),
	}));

	return (
		<div className="border-t border-theme pt-4 space-y-3">
			<div className="flex items-baseline justify-between">
				<p className="text-xl">Gate #{currentGate}</p>
				<p className="text-base text-zinc-500">
					{pollsLeft} poll{pollsLeft !== 1 ? "s" : ""} left
				</p>
			</div>
			<ul className="space-y-3">
				{slotsWithStatus.map(({ slot, status }, i) => (
					<li
						key={`${slot.gateTypeId}-${i}`}
						className="flex items-start gap-2"
					>
						<span className="mt-1">{STATUS_ICON[status]}</span>
						<div className="min-w-0">
							<p className={`text-base ${DIFFICULTY_CLASSES[slot.difficulty]}`}>
								{getSlotLabel(slot.gateTypeId)}
							</p>
							<p className="text-base text-zinc-500">
								Risk:{" "}
								<span className={DIFFICULTY_CLASSES[slot.difficulty]}>
									{slot.difficulty}
								</span>
								{" · "}
								{formatRequirement(slot.requirement)}
							</p>
							<p className="text-base text-zinc-500">{STATUS_LABEL[status]}</p>
							{status !== "skipped" &&
								status !== "passed" &&
								status !== "failed" && (
									<p className="text-base text-zinc-300">
										{formatCurrentStat(slot.requirement, evaluationContext)}
									</p>
								)}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

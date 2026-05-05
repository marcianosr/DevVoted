import type {
	GateDifficulty,
	PipelineSlot,
} from "~/domains/runs/models/pipeline.model";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
	SlotEvaluationStatus,
} from "~/domains/runs/services/pipelineEvaluator.service";
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

const DIFFICULTY_CLASSES: Record<GateDifficulty, string> = {
	low: "text-blue-400",
	medium: "text-green-400",
	high: "text-orange-400",
	critical: "text-red-500",
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

const formatCurrentStat = (
	slot: PipelineSlot,
	ctx: PipelineEvaluationContext
): string => {
	const req = slot.requirement;
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
			return `${results.correct}/${results.appeared} correct`;
		}
	}
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
										{formatCurrentStat(slot, evaluationContext)}
									</p>
								)}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

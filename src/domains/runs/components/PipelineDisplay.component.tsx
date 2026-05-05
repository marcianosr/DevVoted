import { formatStorage } from "~/lib/storage";
import type {
	GateDifficulty,
	PipelineSlot,
} from "~/domains/runs/models/pipeline.model";
import type {
	PipelineEvaluation,
	SlotEvaluationStatus,
} from "~/domains/runs/services/pipelineEvaluator.service";
import { getWindowSize } from "~/domains/runs/services/pipelineEvaluator.service";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";

type PipelineDisplayProps = {
	slots: PipelineSlot[];
	evaluation?: PipelineEvaluation;
	totalPollsAnswered: number;
};

const DIFFICULTY_CLASSES: Record<GateDifficulty, string> = {
	low: "text-green-400 border-green-400",
	medium: "text-blue-400 border-blue-400",
	high: "text-orange-400 border-orange-400",
	critical: "text-red-500 border-red-500",
};

type StatusWithInProgress = SlotEvaluationStatus | "in-progress";

const STATUS_ICON: Record<StatusWithInProgress, React.ReactNode> = {
	"in-progress": (
		<span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
	),
	passed: <span className="text-green-400">✓</span>,
	failed: <span className="text-red-400">✗</span>,
	skipped: <span className="text-gray-500">⊘</span>,
};

const STATUS_GROUP_LABEL: Record<StatusWithInProgress, string> = {
	"in-progress": "in progress",
	passed: "successful",
	failed: "failing",
	skipped: "skipped",
};

type PipelineSlotRowProps = {
	slot: PipelineSlot;
	status: StatusWithInProgress;
	windowSize: number;
};

const PipelineSlotRow = ({
	slot,
	status,
	windowSize,
}: PipelineSlotRowProps) => (
	<li className="flex items-center gap-2 text-sm">
		<span className="inline-flex items-center justify-center w-4 h-4 shrink-0">
			{STATUS_ICON[status]}
		</span>
		<span className="text-gray-200 w-28 shrink-0">
			{getSlotLabel(slot.gateTypeId)}
		</span>
		<span
			className={`text-xs border px-1 shrink-0 ${DIFFICULTY_CLASSES[slot.difficulty]}`}
		>
			{slot.difficulty}
		</span>
		<span className="text-gray-400 flex-1 text-xs">
			{formatRequirement(slot.requirement, windowSize)}
		</span>
	</li>
);

export const PipelineDisplay = ({
	slots,
	evaluation,
	totalPollsAnswered,
}: PipelineDisplayProps) => {
	if (slots.length === 0) return null;

	const windowSize = getWindowSize(slots);
	const pollsInWindow = totalPollsAnswered % windowSize;
	const pollsRemaining = windowSize - pollsInWindow;

	const slotsWithStatus = slots.map((slot, i) => ({
		slot,
		status: (evaluation?.slotEvaluations[i]?.status ??
			"in-progress") as StatusWithInProgress,
	}));

	const groups = (
		["in-progress", "passed", "failed", "skipped"] as StatusWithInProgress[]
	)
		.map((status) => ({
			status,
			entries: slotsWithStatus.filter((s) => s.status === status),
		}))
		.filter((g) => g.entries.length > 0);

	return (
		<div>
			{!evaluation && (
				<p className="text-white text-md mb-2">
					{pollsRemaining} polls left until gate evaluation
				</p>
			)}

			{groups.map(({ status, entries }) => (
				<div key={status}>
					{evaluation && (
						<p className="text-gray-400 text-xs mt-2 mb-1 flex items-center gap-1.5">
							{STATUS_ICON[status]}
							{entries.length} {STATUS_GROUP_LABEL[status]}{" "}
							{entries.length === 1 ? "check" : "checks"}
						</p>
					)}
					<ul className="flex flex-col gap-2">
						{entries.map(({ slot, status: s }, i) => (
							<PipelineSlotRow
								key={`${slot.gateTypeId}-${i}`}
								slot={slot}
								status={s}
								windowSize={windowSize}
							/>
						))}
					</ul>
				</div>
			))}

			{evaluation && (
				<p
					className={`mt-3 text-xs ${evaluation.passed ? "text-green-400" : "text-red-400"}`}
				>
					{evaluation.passed
						? `▶ Pipeline passed — +${formatStorage(evaluation.totalReward)} storage`
						: "▶ Pipeline failed"}
				</p>
			)}
		</div>
	);
};

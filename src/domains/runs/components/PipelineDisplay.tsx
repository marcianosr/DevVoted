import { formatStorage } from "~/lib/storage";
import type {
	GateDifficulty,
	PipelineSlot,
} from "~/domains/runs/models/pipeline";
import type { PipelineEvaluation } from "~/domains/runs/services/pipelineEvaluator.service";
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

type SlotStatusIconProps = {
	passed?: boolean;
};

const SlotStatusIcon = ({ passed }: SlotStatusIconProps) => {
	if (passed === undefined)
		return (
			<span className="inline-flex items-center justify-center w-4 h-4">
				<span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
			</span>
		);
	return passed ? (
		<span className="text-green-400">✓</span>
	) : (
		<span className="text-red-400">✗</span>
	);
};

type PipelineSlotRowProps = {
	slot: PipelineSlot;
	passed?: boolean;
	windowSize: number;
};

const PipelineSlotRow = ({
	slot,
	passed,
	windowSize,
}: PipelineSlotRowProps) => {
	return (
		<li className="flex items-center gap-2 text-sm">
			<SlotStatusIcon passed={passed} />
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
};

export const PipelineDisplay = ({
	slots,
	evaluation,
	totalPollsAnswered,
}: PipelineDisplayProps) => {
	if (slots.length === 0) return null;

	const windowSize = getWindowSize(slots);
	const pollsInWindow = totalPollsAnswered % windowSize;
	const pollsRemaining = windowSize - pollsInWindow;

	console.log(pollsInWindow);

	return (
		<div>
			<p>
				{!evaluation && (
					<span className="text-white text-md">
						{pollsRemaining} polls left until gate evaluation
					</span>
				)}
			</p>
			<ul className="flex flex-col gap-2">
				{slots.map((slot, index) => {
					const slotEval = evaluation?.slotEvaluations.find(
						(e) => e.slot.gateTypeId === slot.gateTypeId
					);

					return (
						<PipelineSlotRow
							key={`${slot.gateTypeId}-${index}`}
							slot={slot}
							passed={slotEval?.passed}
							windowSize={windowSize}
						/>
					);
				})}
			</ul>
			{evaluation && (
				<p
					className={`mt-3 text-xs ${
						evaluation.passed ? "text-green-400" : "text-red-400"
					}`}
				>
					{evaluation.passed
						? `▶ Pipeline passed — +${formatStorage(evaluation.totalReward)} storage`
						: "▶ Pipeline failed"}
				</p>
			)}
		</div>
	);
};

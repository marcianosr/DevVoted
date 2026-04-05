import { formatStorage } from "~/lib/storage";
import type {
	GateDifficulty,
	PipelineSlot,
} from "~/domains/runs/models/pipeline";
import type { PipelineEvaluation } from "~/domains/runs/services/pipelineEvaluator.service";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";

type PipelineDisplayProps = {
	slots: PipelineSlot[];
	evaluation?: PipelineEvaluation;
};

const DIFFICULTY_CLASSES: Record<GateDifficulty, string> = {
	easy: "text-green-400 border-green-400",
	normal: "text-blue-400 border-blue-400",
	hard: "text-orange-400 border-orange-400",
	intense: "text-red-500 border-red-500",
};

type SlotStatusIconProps = {
	passed?: boolean;
	isPermanentModifier: boolean;
};

const SlotStatusIcon = ({
	passed,
	isPermanentModifier,
}: SlotStatusIconProps) => {
	if (isPermanentModifier) return <span className="text-purple-400">◈</span>;
	if (passed === undefined)
		return <span className="text-gray-500 animate-pulse">⏳</span>;
	return passed ? (
		<span className="text-green-400">✓</span>
	) : (
		<span className="text-red-400">✗</span>
	);
};

type PipelineSlotRowProps = {
	slot: PipelineSlot;
	passed?: boolean;
};

const PipelineSlotRow = ({ slot, passed }: PipelineSlotRowProps) => {
	const isPermanentModifier = slot.requirement.type === "storage-drain";

	return (
		<li className="flex items-center gap-2 font-mono text-sm">
			<SlotStatusIcon
				passed={passed}
				isPermanentModifier={isPermanentModifier}
			/>
			<span className="text-gray-200 w-28 shrink-0">
				{getSlotLabel(slot.gateTypeId)}
			</span>
			<span
				className={`text-xs border px-1 shrink-0 ${DIFFICULTY_CLASSES[slot.difficulty]}`}
			>
				{slot.difficulty}
			</span>
			<span className="text-gray-400 flex-1 text-xs">
				{formatRequirement(slot.requirement)}
			</span>
			{!isPermanentModifier && (
				<span className="text-yellow-400 text-xs shrink-0">
					+{formatStorage(slot.reward)}
				</span>
			)}
			{isPermanentModifier && (
				<span className="text-purple-400 text-xs shrink-0">modifier</span>
			)}
		</li>
	);
};

export const PipelineDisplay = ({
	slots,
	evaluation,
}: PipelineDisplayProps) => {
	if (slots.length === 0) return null;

	return (
		<div>
			<p className="text-gray-500 text-xs font-mono mb-2 uppercase tracking-widest">
				CI Pipeline
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
						/>
					);
				})}
			</ul>
			{evaluation && (
				<p
					className={`mt-3 text-xs font-mono ${
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

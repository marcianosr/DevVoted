import {
	DIFFICULTY_CLASSES,
	STATUS_ICON,
	type Difficulty,
	type SlotStatus,
} from "./pipelineStyles";

export type PipelineSlotDisplay = {
	id: string;
	status: SlotStatus;
	label: string;
	difficulty: Difficulty;
	requirement: string;
	reward: string;
};

type SlotGroup = {
	status: SlotStatus;
	label: string;
	entries: PipelineSlotDisplay[];
};

const GROUP_LABEL: Record<SlotStatus, string> = {
	"in-progress": "in progress",
	passed: "successful",
	failed: "failing",
	skipped: "skipped",
};

const SlotRow = ({ slot }: { slot: PipelineSlotDisplay }) => (
	<li className="flex items-center gap-2 text-sm">
		<span className="inline-flex items-center justify-center w-4 h-4 shrink-0">
			{STATUS_ICON[slot.status]}
		</span>
		<span className="text-gray-200 w-28 shrink-0">{slot.label}</span>
		<span
			className={`text-xs border px-1 shrink-0 ${DIFFICULTY_CLASSES[slot.difficulty]}`}
		>
			{slot.difficulty}
		</span>
		<span className="text-gray-400 flex-1 text-xs">{slot.requirement}</span>
		<span className="text-emerald-400 text-xs whitespace-nowrap shrink-0">
			{slot.reward}
		</span>
	</li>
);

export type PipelineDisplayProps = {
	slots: PipelineSlotDisplay[];
	pollsRemaining?: number;
	evaluation?: {
		passed: boolean;
		totalReward: string;
	};
};

export const PipelineDisplay = ({
	slots,
	pollsRemaining,
	evaluation,
}: PipelineDisplayProps) => {
	if (slots.length === 0) return null;

	const groups = (
		["in-progress", "passed", "failed", "skipped"] as SlotStatus[]
	)
		.map((status) => ({
			status,
			label: GROUP_LABEL[status],
			entries: slots.filter((s) => s.status === status),
		}))
		.filter((g): g is SlotGroup => g.entries.length > 0);

	return (
		<div>
			{pollsRemaining !== undefined && !evaluation && (
				<p className="text-white text-md mb-2">
					{pollsRemaining} polls left until gate evaluation
				</p>
			)}

			{groups.map(({ status, label, entries }) => (
				<div key={status}>
					{evaluation && (
						<p className="text-gray-400 text-xs mt-2 mb-1 flex items-center gap-1.5">
							{STATUS_ICON[status]}
							{entries.length} {label}{" "}
							{entries.length === 1 ? "check" : "checks"}
						</p>
					)}
					<ul className="flex flex-col gap-2">
						{entries.map((slot) => (
							<SlotRow key={slot.id} slot={slot} />
						))}
					</ul>
				</div>
			))}

			{evaluation && (
				<p
					className={`mt-3 text-xs ${evaluation.passed ? "text-green-400" : "text-red-400"}`}
				>
					{evaluation.passed
						? `▶ Pipeline passed — ${evaluation.totalReward} storage`
						: "▶ Pipeline failed"}
				</p>
			)}
		</div>
	);
};

import {
	DIFFICULTY_CLASSES,
	STATUS_ICON,
	type Difficulty,
	type SlotStatus,
} from "./pipelineStyles";

export type GateSlotDisplay = {
	id: string;
	status: SlotStatus;
	label: string;
	difficulty: Difficulty;
	requirement: string;
	currentStat?: string;
};

const STATUS_LABEL: Record<SlotStatus, React.ReactNode> = {
	"in-progress": <span className="text-yellow-400">in progress</span>,
	passed: <span className="text-green-400">passed</span>,
	failed: <span className="text-red-400">failed</span>,
	skipped: <span className="text-zinc-500">skipped</span>,
};

export type GateHealthProps = {
	gateNumber: number;
	pollsLeft: number;
	slots: GateSlotDisplay[];
};

export const GateHealth = ({
	gateNumber,
	pollsLeft,
	slots,
}: GateHealthProps) => (
	<div className="border-t border-theme pt-4 space-y-3">
		<div className="flex items-baseline justify-between">
			<p className="text-xl">Gate #{gateNumber}</p>
			<p className="text-base text-zinc-500">
				{pollsLeft} poll{pollsLeft !== 1 ? "s" : ""} left
			</p>
		</div>
		<ul className="space-y-3">
			{slots.map((slot) => (
				<li key={slot.id} className="flex items-start gap-2">
					<span className="mt-1">{STATUS_ICON[slot.status]}</span>
					<div className="min-w-0">
						<p className={`text-base ${DIFFICULTY_CLASSES[slot.difficulty]}`}>
							{slot.label}
						</p>
						<p className="text-base text-zinc-500">
							Risk:{" "}
							<span className={DIFFICULTY_CLASSES[slot.difficulty]}>
								{slot.difficulty}
							</span>
							{" · "}
							{slot.requirement}
						</p>
						<p className="text-base text-zinc-500">
							{STATUS_LABEL[slot.status]}
						</p>
						{slot.currentStat && slot.status === "in-progress" && (
							<p className="text-base text-zinc-300">{slot.currentStat}</p>
						)}
					</div>
				</li>
			))}
		</ul>
	</div>
);

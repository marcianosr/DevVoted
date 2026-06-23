import {
	DIFFICULTY_CLASSES,
	STATUS_ICON,
	type Difficulty,
	type SlotStatus,
} from "./pipelineStyles";

export type { Difficulty, SlotStatus };

const GROUP_LABEL: Record<SlotStatus, string> = {
	"in-progress": "in progress",
	passed: "successful",
	failed: "failing",
	skipped: "skipped",
};

const RewardBadge = ({ reward }: { reward: string }) => (
	<span className="text-emerald-400 text-xs whitespace-nowrap">{reward}</span>
);

const DifficultyLabel = ({
	difficulty,
	text,
}: {
	difficulty: Difficulty;
	text?: string;
}) => (
	<span className={DIFFICULTY_CLASSES[difficulty]}>
		{text && <span className="text-white">{text}</span>} {difficulty}
	</span>
);

// — Current Pipeline —

export type CurrentPipelineSlot = {
	id: string;
	status: SlotStatus;
	label: string;
	difficulty: Difficulty;
	requirement: string;
	reward: string;
	currentStat?: string;
};

export type CurrentPipelineUIProps = {
	gateNumber?: number;
	pollsLeft?: number;
	totalPotentialReward?: string;
	evaluation?: {
		passed: boolean;
		totalReward: string;
	};
	slots: CurrentPipelineSlot[];
};

export const CurrentPipelineUI = ({
	gateNumber,
	pollsLeft,
	totalPotentialReward,
	evaluation,
	slots,
}: CurrentPipelineUIProps) => {
	const groups = (
		["in-progress", "passed", "failed", "skipped"] as SlotStatus[]
	)
		.map((status) => ({
			status,
			entries: slots.filter((s) => s.status === status),
		}))
		.filter((g) => g.entries.length > 0);

	return (
		<div className="border border-white">
			<div className="border-b border-white px-4 py-3">
				<div className="flex items-baseline justify-between">
					<p className="text-2xl">CI Pipelines</p>
					{gateNumber !== undefined && (
						<span className="text-xl">Gate #{gateNumber}</span>
					)}
				</div>
				<p className="text-zinc-300 text-sm mt-0.5">
					{pollsLeft !== undefined && (
						<>
							<span>{pollsLeft} polls left until next gate check</span>
							{" · "}
						</>
					)}
					{slots.length} active {slots.length === 1 ? "check" : "checks"} · all
					<span className="text-yellow-400"> pending</span> checks must pass
				</p>
				{!evaluation && totalPotentialReward && (
					<p className="text-sm mt-1">
						Total reward if all pass:{" "}
						<RewardBadge reward={totalPotentialReward} />
					</p>
				)}
			</div>

			{evaluation?.passed && (
				<div className="bg-emerald-950/40 border-b border-emerald-500/50 px-4 py-3">
					<p className="text-emerald-300 text-lg">
						✓ Pipeline cleared — {evaluation.totalReward} storage added to your
						limit
					</p>
				</div>
			)}

			{groups.map(({ status, entries }) => (
				<div key={status}>
					{evaluation && (
						<div className="px-4 py-2 border-b border-white bg-white/5 flex items-center gap-2 text-sm text-gray-400">
							{STATUS_ICON[status]}
							<span>
								{entries.length} {GROUP_LABEL[status]}{" "}
								{entries.length === 1 ? "check" : "checks"}
							</span>
						</div>
					)}
					{entries.map((slot) => (
						<section
							key={slot.id}
							className="flex items-start gap-3 border-b border-white last:border-b-0 px-4 py-3"
						>
							<span className="mt-0.5 shrink-0">{STATUS_ICON[status]}</span>
							<div>
								<p>
									<span className={DIFFICULTY_CLASSES[slot.difficulty]}>
										{slot.label}
									</span>
								</p>
								<DifficultyLabel text="Risk:" difficulty={slot.difficulty} />
								{" · "}
								Requirement: {slot.requirement}
								{" · "}
								Reward: <RewardBadge reward={slot.reward} />
								{slot.currentStat && slot.status === "in-progress" && (
									<p>
										Current:{" "}
										<span className="text-gray-300">{slot.currentStat}</span>
									</p>
								)}
							</div>
						</section>
					))}
				</div>
			))}
		</div>
	);
};

// — Pipeline Upgrade —

export type UpgradeCardDisplay = {
	kind: "upgrade-slot" | "add-slot";
	label: string;
	difficulty: Difficulty;
	upgradeTo?: Difficulty;
	requirement: string;
	reward: string;
	onSelect: () => void;
};

export type PipelineUpgradeUIProps = {
	pipelineSection: React.ReactNode;
	upgradeCards: UpgradeCardDisplay[];
	addSlotCards: UpgradeCardDisplay[];
	isPending: boolean;
};

const CardEntry = ({
	card,
	isPending,
}: {
	card: UpgradeCardDisplay;
	isPending: boolean;
}) => (
	<div className="border border-white p-4 space-y-1">
		<div className="flex items-center gap-2 mb-2">
			<span className="text-zinc-300">
				{card.kind === "upgrade-slot" ? "↑" : "+"}
			</span>
			<span>{card.label} · </span>
			<DifficultyLabel difficulty={card.difficulty} />
			{card.upgradeTo && (
				<DifficultyLabel text="→" difficulty={card.upgradeTo} />
			)}
		</div>
		<p className="text-zinc-300 text-sm pl-4">
			Requirement: <span className="text-gray-200">{card.requirement}</span>
		</p>
		<p className="text-zinc-300 text-sm pl-4">
			Reward on pass: <RewardBadge reward={card.reward} />
		</p>
		<div className="pl-4 pt-2">
			<button
				onClick={card.onSelect}
				disabled={isPending}
				className="border border-white px-4 py-2 text-lg text-white hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			>
				Select
			</button>
		</div>
	</div>
);

const SectionHeader = ({
	title,
	subtitle,
}: {
	title: string;
	subtitle: string;
}) => (
	<div className="border border-white px-4 py-3">
		<h1 className="text-2xl">{title}</h1>
		<p className="text-zinc-300 text-xs mt-0.5">{subtitle}</p>
	</div>
);

export const PipelineUpgradeUI = ({
	pipelineSection,
	upgradeCards,
	addSlotCards,
	isPending,
}: PipelineUpgradeUIProps) => (
	<div>
		<div className="mb-4">
			<h2 className="text-green-400 text-4xl">Pipeline check passed!</h2>
			<span>Select a new pipeline or upgrade an existing one.</span>
		</div>
		<div className="space-y-6">
			{pipelineSection}

			<section className="flex flex-col gap-6">
				{upgradeCards.length > 0 && (
					<div className="space-y-4">
						<SectionHeader
							title="Modify Existing Slots"
							subtitle="Increase difficulty, higher reward, higher risk"
						/>
						{upgradeCards.map((card, i) => (
							<CardEntry key={i} card={card} isPending={isPending} />
						))}
					</div>
				)}

				{addSlotCards.length > 0 && (
					<div className="space-y-4">
						<SectionHeader
							title="Add New Slot"
							subtitle="More constraints, harder to pass all"
						/>
						<div className="grid grid-cols-1 gap-4">
							{addSlotCards.map((card, i) => (
								<CardEntry key={i} card={card} isPending={isPending} />
							))}
						</div>
					</div>
				)}
			</section>
		</div>
	</div>
);

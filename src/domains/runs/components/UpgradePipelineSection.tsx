import type {
	GateDifficulty,
	PipelineSlot,
	PipelineSlotRequirement,
	UpgradeCard,
} from "~/domains/runs/models/pipeline";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
	SlotEvaluationStatus,
} from "~/domains/runs/services/pipelineEvaluator.service";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";

type UpgradePipelineSectionProps = {
	cards: UpgradeCard[];
	currentSlots: PipelineSlot[];
	onAccept: (card: UpgradeCard) => void;
	isPending?: boolean;
	evaluationContext?: PipelineEvaluationContext;
	evaluation?: PipelineEvaluation;
};

const DIFFICULTY_LABEL: Record<GateDifficulty, string> = {
	low: "low",
	medium: "medium",
	high: "high",
	critical: "critical",
};

const DIFFICULTY_CLASSES: Record<GateDifficulty, string> = {
	low: "text-blue-400 border-blue-400",
	medium: "text-green-400 border-green-400",
	high: "text-orange-400 border-orange-400",
	critical: "text-red-500 border-red-500",
};

const formatCurrentStat = (
	req: PipelineSlotRequirement,
	ctx: PipelineEvaluationContext
): string => {
	switch (req.type) {
		case "correct-answers":
			return `${ctx.correctAnswersInWindow} correct`;
		case "coverage-gain": {
			const val = ctx.coverageGainedInWindow.toFixed(1);
			return ctx.coverageGainedInWindow >= 0 ? `+${val}%` : `${val}%`;
		}
		case "short-window":
			return `${ctx.pollsAnsweredInWindow}/${ctx.pollsInWindow} answered`;
		case "cold-start":
			return `${ctx.firstConsecutiveCorrectFromWindowStart}/${req.count} correct start`;
		case "category-mastery": {
			const results = ctx.categoryPollResults?.[req.category];
			if (!results || results.appeared === 0) return "no polls seen yet";
			return `${results.correct}/${results.appeared} correct`;
		}
	}
};

const SelectButton = ({
	onClick,
	disabled,
}: {
	onClick: () => void;
	disabled: boolean;
}) => (
	<button
		onClick={onClick}
		disabled={disabled}
		className="border border-white px-4 py-2 text-lg text-white hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
	>
		Select
	</button>
);

const CardEntry = ({
	card,
	onAccept,
	isPending,
}: {
	card: UpgradeCard;
	onAccept: (card: UpgradeCard) => void;
	isPending: boolean;
}) => {
	const { slot } = card;
	const isUpgrade = card.kind === "upgrade-slot";

	return (
		<div className="border border-white p-4 space-y-1">
			<div className="flex items-center gap-2 mb-2">
				<span className="text-gray-500">{isUpgrade ? "↑" : "+"}</span>
				<span>{getSlotLabel(slot.gateTypeId)} · </span>
				<DifficultyLabel difficulty={isUpgrade ? card.from : slot.difficulty} />
				{isUpgrade && <DifficultyLabel text={"→"} difficulty={card.to} />}
			</div>
			<p className="text-gray-400 text-sm pl-4">
				Requirement:{" "}
				<span className="text-gray-200">
					{formatRequirement(slot.requirement)}
				</span>
			</p>

			<div className="pl-4 pt-2">
				<SelectButton onClick={() => onAccept(card)} disabled={isPending} />
			</div>
		</div>
	);
};

const SectionHeader = ({
	title,
	subtitle,
}: {
	title: string;
	subtitle: string;
}) => (
	<div className="border border-white px-4 py-3">
		<p className="text-gray-200 text-sm uppercase tracking-widest">{title}</p>
		<p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>
	</div>
);

const DifficultyLabel = ({
	difficulty,
	text,
}: {
	difficulty: GateDifficulty;
	text?: string;
}) => (
	<span className={DIFFICULTY_CLASSES[difficulty]}>
		<span className="text-white">{text}</span> {DIFFICULTY_LABEL[difficulty]}
	</span>
);

type StatusWithInProgress = SlotEvaluationStatus | "in-progress";

const STATUS_ICON: Record<StatusWithInProgress, React.ReactNode> = {
	"in-progress": (
		<span className="inline-block w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
	),
	passed: <span className="text-green-400">✓</span>,
	failed: <span className="text-red-400">✗</span>,
	skipped: <span className="inline-block w-3 h-3 rounded-full bg-gray-400" />,
};

const STATUS_GROUP_LABEL: Record<StatusWithInProgress, string> = {
	"in-progress": "in progress",
	passed: "successful",
	failed: "failing",
	skipped: "skipped",
};

const CheckGroupHeader = ({
	status,
	count,
}: {
	status: StatusWithInProgress;
	count: number;
}) => (
	<div className="px-4 py-2 border-b border-white bg-white/5 flex items-center gap-2 text-sm text-gray-400">
		{STATUS_ICON[status]}
		<span>
			{count} {STATUS_GROUP_LABEL[status]} {count === 1 ? "check" : "checks"}
		</span>
	</div>
);

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

export const CurrentPipeline = ({
	slots,
	evaluationContext,
	evaluation,
}: {
	slots: PipelineSlot[];
	evaluationContext?: PipelineEvaluationContext;
	evaluation?: PipelineEvaluation;
}) => {
	const slotsWithStatus = slots.map((slot, i) => ({
		slot,
		status: evaluation
			? ((evaluation.slotEvaluations[i]?.status ??
					"in-progress") as StatusWithInProgress)
			: getLiveStatus(slot, evaluationContext),
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
		<div className="border border-white">
			<div className="border-b border-white px-4 py-3">
				<p className="text-white text-2xl">CI Pipelines</p>
				{evaluationContext && (
					<span className="text-lg">Gate #{evaluationContext.currentGate}</span>
				)}
				<p className="text-gray-300">
					{evaluationContext && (
						<>
							<span className="text-gray-300">
								{evaluationContext.pollsInWindow -
									evaluationContext.pollsAnsweredInWindow}{" "}
								polls left until next gate check
							</span>
							{" · "}
						</>
					)}
					{slots.length} active {slots.length === 1 ? "check" : "checks"} · all
					checks must pass
				</p>
			</div>

			{groups.map(({ status, entries }) => (
				<div key={status}>
					{evaluation && (
						<CheckGroupHeader status={status} count={entries.length} />
					)}
					{entries.map(({ slot }, i) => (
						<section
							key={`${slot.gateTypeId}-${i}`}
							className="flex items-start gap-3 border-b border-white last:border-b-0 px-4 py-3"
						>
							<span className="mt-0.5 shrink-0">{STATUS_ICON[status]}</span>
							<div>
								<p>
									<span className={DIFFICULTY_CLASSES[slot.difficulty]}>
										{getSlotLabel(slot.gateTypeId)}
									</span>
								</p>
								<>
									<DifficultyLabel text="Risk:" difficulty={slot.difficulty} />
									{" · "}
									Requirement: {formatRequirement(slot.requirement)}
								</>
								{evaluationContext && (
									<p>
										Current:{" "}
										<span className="text-gray-300">
											{formatCurrentStat(slot.requirement, evaluationContext)}
										</span>
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

export const UpgradePipelineSection = ({
	cards,
	currentSlots,
	onAccept,
	isPending = false,
	evaluationContext,
	evaluation,
}: UpgradePipelineSectionProps) => {
	const upgradeCards = cards.filter(
		(c): c is Extract<UpgradeCard, { kind: "upgrade-slot" }> =>
			c.kind === "upgrade-slot"
	);
	const addSlotCards = cards.filter(
		(c): c is Extract<UpgradeCard, { kind: "add-slot" }> =>
			c.kind === "add-slot"
	);

	return (
		<div className="space-y-6">
			<CurrentPipeline
				slots={currentSlots}
				evaluationContext={evaluationContext}
				evaluation={evaluation}
			/>

			<section className="flex flex-wrap gap-4">
				{upgradeCards.length > 0 && (
					<div>
						<SectionHeader
							title="Modify Existing Slots"
							subtitle="Increase difficulty, higher reward, higher risk"
						/>
						{upgradeCards.map((card, i) => (
							<CardEntry
								key={i}
								card={card}
								onAccept={onAccept}
								isPending={isPending}
							/>
						))}
					</div>
				)}

				{addSlotCards.length > 0 && (
					<div>
						<SectionHeader
							title="Add New Slot"
							subtitle="More constraints, harder to pass all"
						/>
						<div className="flex">
							{addSlotCards.map((card, i) => (
								<CardEntry
									key={i}
									card={card}
									onAccept={onAccept}
									isPending={isPending}
								/>
							))}
						</div>
					</div>
				)}
			</section>
		</div>
	);
};

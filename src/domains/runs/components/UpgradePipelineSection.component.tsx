import { useState } from "react";

import type {
	GateDifficulty,
	PipelineSlot,
	UpgradeCard,
} from "~/domains/runs/models/pipeline.model";
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
import { formatStorage } from "~/lib/storage";
import { PrimaryButton } from "~/ui/PrimaryButton.component";
import { PipelineUpgradeCard } from "~/ui/runs/PipelineUpgradeCard.ui";

const cardBadge = (card: UpgradeCard) =>
	card.kind === "add-slot" ? "Add pipeline" : "Upgrade";

const cardDescription = (card: UpgradeCard) =>
	card.kind === "add-slot"
		? "Add a new check — every check must pass at the next gate."
		: "Strengthen an existing check for a bigger payout.";

const confirmLabel = (count: number) => {
	if (count === 0) return "Select at least one pipeline";
	return `Continue with ${count} pipeline${count === 1 ? "" : "s"} →`;
};

const RewardBadge = ({ reward }: { reward: number }) => (
	<span className="text-emerald-400 text-xs whitespace-nowrap">
		+{formatStorage(reward)} storage
	</span>
);

type UpgradePipelineSectionProps = {
	cards: UpgradeCard[];
	currentSlots: PipelineSlot[];
	onConfirm: (cards: UpgradeCard[]) => void;
	isPending?: boolean;
	evaluationContext?: PipelineEvaluationContext;
	evaluation?: PipelineEvaluation;
};

const DifficultyLabel = ({
	difficulty,
	text,
}: {
	difficulty: GateDifficulty;
	text?: string;
}) => (
	<span className={DIFFICULTY_CLASSES[difficulty]}>
		<span className="text-white">{text}</span> {difficulty}
	</span>
);

type StatusWithInProgress = SlotEvaluationStatus | "in-progress";

const STATUS_ICON: Record<StatusWithInProgress, React.ReactNode> = {
	"in-progress": (
		<span className="inline-block w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
	),
	passed: <span className="text-green-400">✓</span>,
	failed: <span className="text-red-400">✗</span>,
	skipped: <span className="inline-block w-3 h-3 rounded-full bg-zinc-300" />,
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

	const totalPotentialReward = slots.reduce((sum, s) => sum + s.reward, 0);

	return (
		<div className="border border-white">
			<div className="border-b border-white px-4 py-3">
				<div className="flex items-baseline justify-between">
					<p className="text-2xl">CI Pipelines</p>
					{evaluationContext && (
						<span className="text-xl">
							Gate #{evaluationContext.currentGate}
						</span>
					)}
				</div>
				<p className="text-zinc-300 text-sm mt-0.5">
					{evaluationContext && (
						<>
							<span>
								{evaluationContext.pollsInWindow -
									evaluationContext.pollsAnsweredInWindow}{" "}
								polls left until next gate check
							</span>
							{" · "}
						</>
					)}
					{slots.length} active {slots.length === 1 ? "check" : "checks"} · all
					<span className="text-yellow-400"> pending</span> checks must pass
				</p>
				{!evaluation && totalPotentialReward > 0 && (
					<p className="text-sm mt-1">
						Total reward if all pass:{" "}
						<RewardBadge reward={totalPotentialReward} />
					</p>
				)}
			</div>

			{evaluation?.passed && evaluation.totalReward > 0 && (
				<div className="bg-emerald-950/40 border-b border-emerald-500/50 px-4 py-3">
					<p className="text-emerald-300 text-lg">
						✓ Pipeline cleared — +{formatStorage(evaluation.totalReward)}{" "}
						storage added to your limit
					</p>
				</div>
			)}

			{groups.map(({ status, entries }) => (
				<div key={status}>
					{evaluation && (
						<CheckGroupHeader status={status} count={entries.length} />
					)}
					{entries.map(({ slot }, i) => (
						<section
							key={`${slot.gateTypeId}-${i}`}
							className="flex items-start gap-3 border-b border-white px-4 py-3"
						>
							<span className="mt-0.5 shrink-0">{STATUS_ICON[status]}</span>
							<div>
								<p>
									<span className={DIFFICULTY_CLASSES[slot.difficulty]}>
										{getSlotLabel(slot.gateTypeId)}
									</span>
								</p>
								<DifficultyLabel text="Risk:" difficulty={slot.difficulty} />
								{" · "}
								Requirement: {formatRequirement(slot.requirement)}
								{" · "}
								Reward: <RewardBadge reward={slot.reward} />
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
	onConfirm,
	isPending = false,
	evaluationContext,
	evaluation,
}: UpgradePipelineSectionProps) => {
	const [selected, setSelected] = useState<Set<number>>(new Set());

	const toggle = (index: number) =>
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(index)) {
				next.delete(index);
				return next;
			}
			next.add(index);
			return next;
		});

	const selectedCards = cards.filter((_, i) => selected.has(i));

	return (
		<div className="space-y-6">
			<CurrentPipeline
				slots={currentSlots}
				evaluationContext={evaluationContext}
				evaluation={evaluation}
			/>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl">Add or upgrade a pipeline</h2>
					<p className="text-zinc-300 text-sm">
						More pipelines = more reward, but every one must pass at the next
						gate. Add a new check, or strengthen one you trust.
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{cards.map((card, i) => (
						<PipelineUpgradeCard
							key={i}
							badge={cardBadge(card)}
							title={getSlotLabel(card.slot.gateTypeId)}
							slug={card.slot.gateTypeId}
							reward={card.slot.reward}
							needs={formatRequirement(card.slot.requirement)}
							description={cardDescription(card)}
							riskClassName={DIFFICULTY_CLASSES[card.slot.difficulty]}
							selected={selected.has(i)}
							onToggle={() => toggle(i)}
							disabled={isPending}
						/>
					))}
				</div>
				<div className="flex justify-end">
					<PrimaryButton
						onClick={() => onConfirm(selectedCards)}
						disabled={selectedCards.length === 0 || isPending}
					>
						{confirmLabel(selectedCards.length)}
					</PrimaryButton>
				</div>
			</section>
		</div>
	);
};

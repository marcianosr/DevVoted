import { useState } from "react";

import type {
	PipelineSlot,
	UpgradeCard,
} from "~/domains/runs/models/pipeline.model";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";
import { DIFFICULTY_CLASSES } from "~/domains/runs/utils/difficultyStyles";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";
import { PrimaryButton } from "~/ui/PrimaryButton.component";
import { PipelineUpgradeCard } from "~/ui/runs/PipelineUpgradeCard.ui";

import { CurrentPipeline } from "./CurrentPipeline.component";

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

type UpgradePipelineSectionProps = {
	cards: UpgradeCard[];
	currentSlots: PipelineSlot[];
	onConfirm: (cards: UpgradeCard[]) => void;
	isPending?: boolean;
	evaluationContext?: PipelineEvaluationContext;
	evaluation?: PipelineEvaluation;
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
				current={evaluationContext}
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

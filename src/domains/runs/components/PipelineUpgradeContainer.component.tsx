import type {
	PipelineSlot,
	UpgradeCard,
} from "~/domains/runs/models/pipeline.model";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";
import {
	formatRequirement,
	getSlotLabel,
} from "~/domains/runs/utils/formatPipelineRequirement";
import { formatStorage } from "~/lib/storage";
import {
	PipelineUpgradeUI,
	type UpgradeCardDisplay,
} from "~/ui/runs/PipelineUpgrade.ui";
import { CurrentPipeline } from "./UpgradePipelineSection.component";

type PipelineUpgradeContainerProps = {
	cards: UpgradeCard[];
	currentSlots: PipelineSlot[];
	onAccept: (card: UpgradeCard) => void;
	isPending: boolean;
	evaluationContext?: PipelineEvaluationContext;
	evaluation?: PipelineEvaluation;
};

const toUpgradeCardDisplay = (
	card: Extract<UpgradeCard, { kind: "upgrade-slot" | "add-slot" }>,
	onAccept: (card: UpgradeCard) => void
): UpgradeCardDisplay => {
	const { slot } = card;
	return {
		kind: card.kind,
		label: getSlotLabel(slot.gateTypeId),
		difficulty: card.kind === "upgrade-slot" ? card.from : slot.difficulty,
		upgradeTo: card.kind === "upgrade-slot" ? card.to : undefined,
		requirement: formatRequirement(slot.requirement),
		reward: `+${formatStorage(slot.reward)}`,
		onSelect: () => onAccept(card),
	};
};

export const PipelineUpgradeContainer = ({
	cards,
	currentSlots,
	onAccept,
	isPending,
	evaluationContext,
	evaluation,
}: PipelineUpgradeContainerProps) => {
	const upgradeCards = cards
		.filter(
			(c): c is Extract<UpgradeCard, { kind: "upgrade-slot" }> =>
				c.kind === "upgrade-slot"
		)
		.map((c) => toUpgradeCardDisplay(c, onAccept));

	const addSlotCards = cards
		.filter(
			(c): c is Extract<UpgradeCard, { kind: "add-slot" }> =>
				c.kind === "add-slot"
		)
		.map((c) => toUpgradeCardDisplay(c, onAccept));

	return (
		<PipelineUpgradeUI
			pipelineSection={
				<CurrentPipeline
					slots={currentSlots}
					evaluationContext={evaluationContext}
					evaluation={evaluation}
				/>
			}
			upgradeCards={upgradeCards}
			addSlotCards={addSlotCards}
			isPending={isPending}
		/>
	);
};

import type {
	PipelineSlot,
	UpgradeCard,
} from "~/domains/runs/models/pipeline.model";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";

import { UpgradePipelineSection } from "./UpgradePipelineSection.component";

type PipelineUpgradeContainerProps = {
	cards: UpgradeCard[];
	currentSlots: PipelineSlot[];
	onAccept: (card: UpgradeCard) => void;
	isPending: boolean;
	evaluationContext?: PipelineEvaluationContext;
	evaluation?: PipelineEvaluation;
};

export const PipelineUpgradeContainer = ({
	cards,
	currentSlots,
	onAccept,
	isPending,
	evaluationContext,
	evaluation,
}: PipelineUpgradeContainerProps) => (
	<div>
		<div className="mb-4">
			<h2 className="text-green-400 text-4xl">Pipeline check passed!</h2>
			<span>Select a new pipeline or upgrade an existing one.</span>
		</div>
		<UpgradePipelineSection
			cards={cards}
			currentSlots={currentSlots}
			onAccept={onAccept}
			isPending={isPending}
			evaluationContext={evaluationContext}
			evaluation={evaluation}
		/>
	</div>
);

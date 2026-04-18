import type { ExposedConfigDeck } from "~/domains/runs/api/queries";
import type { PipelineSlot, UpgradeCard } from "~/domains/runs/models/pipeline";
import type { PipelineEvaluationContext } from "~/domains/runs/services/pipelineEvaluator.service";
import type { ScoreCalculation } from "~/domains/score/services/score.service";
import type { CategoryCode } from "~/domains/shared/categories";
import type { CommunityStats } from "~/domains/polls/api/queries";
import type { PollOption } from "~/domains/polls/models/pollOption";
import SelectedOptionsSummary from "~/domains/polls/components/SelectedOptionsSummary";

import { UpgradePipelineSection } from "./UpgradePipelineSection";

type PipelineUpgradeContainerProps = {
	cards: UpgradeCard[];
	currentSlots: PipelineSlot[];
	onAccept: (card: UpgradeCard) => void;
	isPending: boolean;
	evaluationContext?: PipelineEvaluationContext;
	// Poll result props — shown above the upgrade section when the user has answered
	hasAnswered: boolean;
	options: PollOption[];
	selectedOptions: string[];
	score?: ScoreCalculation;
	communityStats?: CommunityStats;
	categoryCode: CategoryCode;
	explanation?: string | null;
	exposedConfigDeck?: ExposedConfigDeck | null;
};

export const PipelineUpgradeContainer = ({
	cards,
	currentSlots,
	onAccept,
	isPending,
	evaluationContext,
	hasAnswered,
	options,
	selectedOptions,
	score,
	communityStats,
	categoryCode,
	explanation,
	exposedConfigDeck,
}: PipelineUpgradeContainerProps) => (
	<div>
		{hasAnswered && (
			<SelectedOptionsSummary
				options={options}
				selectedOptions={selectedOptions}
				score={score}
				communityStats={communityStats}
				categoryCode={categoryCode}
				explanation={explanation}
				exposedConfigDeck={exposedConfigDeck}
			/>
		)}
		<div className="mt-8">
			<h2 className="text-green-400 text-2xl mb-6">
				Pipeline check passed! Select a new pipeline or upgrade an existing one.
			</h2>
			<UpgradePipelineSection
				cards={cards}
				currentSlots={currentSlots}
				onAccept={onAccept}
				isPending={isPending}
				evaluationContext={evaluationContext}
			/>
		</div>
	</div>
);

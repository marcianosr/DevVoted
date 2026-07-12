import type { CategoryCode } from "~/domains/shared/categories";
import type { Config } from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { GateRequirementList } from "../gate/GateRequirementList.ui";
import { GateTracker } from "../gate/GateTracker.ui";
import { Pipeline } from "../pipeline/Pipeline.ui";
import { AnswerType, PollCard, PollOption } from "../poll/PollCard.ui";
import { StatBadge } from "../run/StatBadge.ui";

type AnsweringScreenProps = {
	gatesCleared: number;
	victoryGate: number;
	pollsToGate: number;
	coverage: number;
	storage: number;
	configs: readonly Config[];
	slots: number;
	checks: readonly CheckStatus[];
	category: CategoryCode;
	question: string;
	options: readonly PollOption[];
	answerType: AnswerType;
	selectedOptionIds?: readonly string[];
	disabledOptionIds?: readonly string[];
	canLint?: boolean;
	lintCost?: number;
	onSelect: (optionId: string) => void;
	onSubmit?: () => void;
	onLint?: () => void;
};

export const AnsweringScreen = ({
	gatesCleared,
	victoryGate,
	pollsToGate,
	coverage,
	storage,
	configs,
	slots,
	checks,
	category,
	question,
	options,
	answerType,
	selectedOptionIds,
	disabledOptionIds,
	canLint,
	lintCost,
	onSelect,
	onSubmit,
	onLint,
}: AnsweringScreenProps) => (
	<div className="flex flex-col gap-6">
		<GateTracker total={victoryGate} cleared={gatesCleared} />
		<div className="flex flex-wrap gap-6">
			<StatBadge
				label="Gate"
				value={`${gatesCleared + 1}/${victoryGate}`}
				category={category}
			/>
			<StatBadge
				label="Gate in"
				value={`${pollsToGate} poll${pollsToGate === 1 ? "" : "s"}`}
				category={category}
			/>
			<StatBadge label="Coverage" value={`${coverage}%`} category={category} />
			<StatBadge label="Storage" value={`${storage}KB`} category={category} />
		</div>
		<Pipeline configs={configs} slots={slots} />
		<GateRequirementList checks={checks} />
		<PollCard
			category={category}
			question={question}
			options={options}
			answerType={answerType}
			selectedOptionIds={selectedOptionIds}
			disabledOptionIds={disabledOptionIds}
			canLint={canLint}
			lintCost={lintCost}
			onSelect={onSelect}
			onSubmit={onSubmit}
			onLint={onLint}
		/>
	</div>
);

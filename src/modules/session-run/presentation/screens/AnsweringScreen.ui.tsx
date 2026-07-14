import type { CategoryCode } from "~/domains/shared/categories";
import type { Config } from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { GateRequirementList } from "../gate/GateRequirementList.ui";
import { PollCard, PollOption } from "../poll/PollCard.ui";
import { StatBadge } from "../run/StatBadge.ui";

type AnsweringScreenProps = {
	gatesCleared: number;
	victoryGate: number;
	pollsToGate: number;
	coverage: number;
	storage: number;
	configs: readonly Config[];
	checks: readonly CheckStatus[];
	gateReward: number;
	category: CategoryCode;
	question: string;
	options: readonly PollOption[];
	selectedOptionIds?: readonly string[];
	disabledOptionIds?: readonly string[];
	canLint?: boolean;
	lintReady?: boolean;
	linter?: Config;
	lintCost?: number;
	onSelect: (optionId: string) => void;
	onLint?: () => void;
};

export const AnsweringScreen = ({
	gatesCleared,
	victoryGate,
	pollsToGate,
	coverage,
	storage,
	configs,
	checks,
	gateReward,
	category,
	question,
	options,
	selectedOptionIds,
	disabledOptionIds,
	canLint,
	lintReady,
	linter,
	lintCost,
	onSelect,
	onLint,
}: AnsweringScreenProps) => (
	<div className="flex flex-col gap-6">
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
		<PollCard
			category={category}
			question={question}
			options={options}
			selectedOptionIds={selectedOptionIds}
			disabledOptionIds={disabledOptionIds}
			canLint={canLint}
			lintReady={lintReady}
			linter={linter}
			lintCost={lintCost}
			onSelect={onSelect}
			onLint={onLint}
		/>
		<GateRequirementList
			checks={checks}
			configs={configs}
			gateNumber={gatesCleared + 1}
			pollsToGate={pollsToGate}
			gateReward={gateReward}
			compact
		/>
	</div>
);

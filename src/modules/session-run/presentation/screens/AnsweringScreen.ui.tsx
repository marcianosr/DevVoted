import type { CategoryCode } from "~/domains/shared/categories";
import type { Config } from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { roleRows } from "~/modules/session-run/gate/configRole.model";
import { Button } from "~/ui/Button.component";
import { RoleList } from "../gate/RoleList.ui";
import { PollCard, PollOption } from "../poll/PollCard.ui";

type AnsweringScreenProps = {
	configs: readonly Config[];
	checks: readonly CheckStatus[];
	category: CategoryCode;
	question: string;
	options: readonly PollOption[];
	selectedOptionIds?: readonly string[];
	disabledOptionIds?: readonly string[];
	canLint?: boolean;
	lintReady?: boolean;
	linter?: Config;
	lintCost?: number;
	canSubmit: boolean;
	onSelect: (optionId: string) => void;
	onSubmit: () => void;
	onLint?: () => void;
};

export const AnsweringScreen = ({
	configs,
	checks,
	category,
	question,
	options,
	selectedOptionIds,
	disabledOptionIds,
	canLint,
	lintReady,
	linter,
	lintCost,
	canSubmit,
	onSelect,
	onSubmit,
	onLint,
}: AnsweringScreenProps) => (
	<div className="flex flex-col gap-6">
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
		<div className="flex justify-end">
			<Button className="rounded-lg" disabled={!canSubmit} onClick={onSubmit}>
				Submit answer →
			</Button>
		</div>
		<RoleList rows={roleRows(configs, checks)} />
	</div>
);

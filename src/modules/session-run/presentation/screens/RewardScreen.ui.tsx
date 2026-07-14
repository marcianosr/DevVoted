import type { AnsweredPoll } from "~/modules/session-run/climb/sessionRun.model";
import type { Config } from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { CheckList } from "../gate/CheckList.ui";
import { AnswerResults } from "../run/AnswerResults.ui";
import { CoverageByCategory } from "../run/CoverageByCategory.ui";

type RewardScreenProps = {
	gatesCleared: number;
	storage: number;
	answered: readonly AnsweredPoll[];
	coverageByCategory: Readonly<Record<string, number>>;
	passedChecks: readonly CheckStatus[];
	configs: readonly Config[];
};

export const RewardScreen = ({
	gatesCleared,
	storage,
	answered,
	coverageByCategory,
	passedChecks,
	configs,
}: RewardScreenProps) => (
	<div className="flex flex-col gap-6">
		<div className="rounded-xl border border-viridian bg-viridian/10 p-6">
			<Title>
				<span className="text-viridian">Gate #{gatesCleared} cleared!</span>
			</Title>
			<Paragraph>
				Storage: <span className="font-bold text-saffron">{storage}KB</span>
			</Paragraph>
		</div>

		<CheckList checks={passedChecks} configs={configs} />

		<AnswerResults answered={answered} />

		<CoverageByCategory coverageByCategory={coverageByCategory} />
	</div>
);

import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { roleRows } from "~/modules/run/gate/configRole.model";
import { roundToOneDecimal } from "~/modules/run/rules.model";
import { Title } from "~/ui/typography/Title.component";
import { RoleList } from "../gate/RoleList.ui";
import { ReviewAnswers } from "../run/ReviewAnswers.ui";
import { CoverageByCategory } from "../run/CoverageByCategory.ui";
import { StatBadge } from "../run/StatBadge.ui";

type RewardScreenProps = {
	gatesCleared: number;
	gateReward: number;
	answered: readonly AnsweredPoll[];
	coverageGainedByCategory: Readonly<Record<string, number>>;
	passedChecks: readonly CheckStatus[];
	configs: readonly Config[];
};

export const RewardScreen = ({
	gatesCleared,
	gateReward,
	answered,
	coverageGainedByCategory,
	passedChecks,
	configs,
}: RewardScreenProps) => {
	const totalCoverageGained = roundToOneDecimal(
		Object.values(coverageGainedByCategory).reduce((sum, pct) => sum + pct, 0)
	);

	return (
		<div className="flex flex-col gap-4">
			<Title as="h2" tone="gradient">
				Gate #{gatesCleared} cleared!
			</Title>

			<section className="flex flex-col gap-2 rounded-r-xl border-l-4 border-viridian bg-linear-to-r from-viridian/10 to-transparent p-4">
				<Title as="h3" size="md">
					Rewards
				</Title>
				<div className="flex flex-wrap gap-2">
					<StatBadge
						label="Storage reward"
						value={`+${gateReward}KB`}
						valueTone="gradient"
					/>
					<StatBadge
						label="Coverage gained"
						value={`+${totalCoverageGained}%`}
					/>
				</div>
				<CoverageByCategory
					coverageByCategory={coverageGainedByCategory}
					prefix="+"
				/>
			</section>

			<div className="space-y-2">
				<Title as="h3" size="sm">
					Pipelines status
				</Title>
				<RoleList rows={roleRows(configs, passedChecks)} />
			</div>

			<ReviewAnswers answered={answered} />
		</div>
	);
};

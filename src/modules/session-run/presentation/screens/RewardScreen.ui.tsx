import type { AnsweredPoll } from "~/modules/session-run/climb/sessionRun.model";
import type { Config } from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { roleRows } from "~/modules/session-run/gate/configRole.model";
import { GradientText } from "~/ui/typography/GradientText.component";
import { Title } from "~/ui/typography/Title.component";
import { RoleList } from "../gate/RoleList.ui";
import { AnswerResults } from "../run/AnswerResults.ui";
import { CoverageByCategory } from "../run/CoverageByCategory.ui";
import { StatBadge } from "../run/StatBadge.ui";

type RewardScreenProps = {
	gatesCleared: number;
	/** Storage (KB) this clear paid out. */
	gateReward: number;
	answered: readonly AnsweredPoll[];
	/** Coverage earned per category in this gate. */
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
	const totalCoverageGained =
		Math.round(
			Object.values(coverageGainedByCategory).reduce(
				(sum, pct) => sum + pct,
				0
			) * 10
		) / 10;

	return (
		<div className="flex flex-col gap-6">
			<GradientText as="h2" className="text-3xl font-extrabold tracking-tight">
				Gate #{gatesCleared} cleared!
			</GradientText>

			<section className="flex flex-col gap-3">
				<Title as="h3" size="sm">
					Rewards
				</Title>
				<div className="flex flex-wrap gap-8">
					<StatBadge
						label="Storage reward"
						value={<GradientText>+{gateReward}KB</GradientText>}
					/>
					<StatBadge
						label="Coverage gained"
						value={`+${totalCoverageGained}%`}
					/>
				</div>
				<CoverageByCategory
					coverageByCategory={coverageGainedByCategory}
					title="Coverage per category"
					subtitle="What you earned clearing this gate"
					prefix="+"
				/>
			</section>

			<div className="space-y-2">
				<Title as="h3" size="sm">
					Pipelines status
				</Title>
				<RoleList rows={roleRows(configs, passedChecks)} />
			</div>

			<AnswerResults answered={answered} />
		</div>
	);
};

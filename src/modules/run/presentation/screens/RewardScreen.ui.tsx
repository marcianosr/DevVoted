import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import {
	gateRewardRows,
	gateStorageGained,
} from "~/modules/run/gate/gateReward.model";
import { roundToOneDecimal } from "~/modules/run/rules.model";
import { GateRewardReport } from "../gate/GateRewardReport.ui";
import { ReviewAnswers } from "../run/ReviewAnswers.ui";

type RewardScreenProps = {
	gatesCleared: number;
	gateReward: number;
	answered: readonly AnsweredPoll[];
	coverageGainedByCategory: Readonly<Record<string, number>>;
	passedChecks: readonly CheckStatus[];
	configs: readonly Config[];
	faucetThisGateKb?: number;
};

export const RewardScreen = ({
	gatesCleared,
	gateReward,
	answered,
	coverageGainedByCategory,
	passedChecks,
	configs,
	faucetThisGateKb,
}: RewardScreenProps) => {
	const coveragePct = roundToOneDecimal(
		Object.values(coverageGainedByCategory).reduce((sum, pct) => sum + pct, 0)
	);
	const rows = gateRewardRows({
		answered,
		configs,
		checks: passedChecks,
		faucetThisGateKb,
	});

	return (
		<div className="flex flex-col gap-4">
			<GateRewardReport
				gateNumber={gatesCleared}
				cleared
				rows={rows}
				totals={{
					storageKb: gateStorageGained(
						configs,
						answered,
						gateReward,
						faucetThisGateKb
					),
					coveragePct,
				}}
			/>

			<ReviewAnswers answered={answered} />
		</div>
	);
};

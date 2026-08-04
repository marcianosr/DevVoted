import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import {
	gateRewardRows,
	gateStorageGained,
} from "~/modules/run/gate/gateReward.model";
import { roundToOneDecimal, STORAGE_CAP_KB } from "~/modules/run/rules.model";
import { GateRewardReport } from "../gate/GateRewardReport.ui";
import { CoverageByCategory } from "../run/CoverageByCategory.ui";
import { ReviewAnswers } from "../run/ReviewAnswers.ui";

type RewardScreenProps = {
	gatesCleared: number;
	gateReward: number;
	answered: readonly AnsweredPoll[];
	coverageGainedByCategory: Readonly<Record<string, number>>;
	passedChecks: readonly CheckStatus[];
	configs: readonly Config[];
	faucetThisGateKb?: number;
	/** The run's storage after the payout — drawn as the winnings bar. */
	storage?: number;
};

export const RewardScreen = ({
	gatesCleared,
	gateReward,
	answered,
	coverageGainedByCategory,
	passedChecks,
	configs,
	faucetThisGateKb,
	storage,
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
	const storageKb = gateStorageGained(
		configs,
		answered,
		gateReward,
		faucetThisGateKb
	);

	return (
		<div className="flex flex-col gap-4">
			<GateRewardReport
				gateNumber={gatesCleared}
				cleared
				rows={rows}
				totals={{ storageKb, coveragePct }}
				storageBar={
					storage === undefined
						? undefined
						: {
								fromKb: Math.max(0, storage - storageKb),
								toKb: storage,
								capKb: STORAGE_CAP_KB,
							}
				}
			/>

			{/* The winnings line's breakdown: one badge per category answered. */}
			<div className="flex justify-center">
				<CoverageByCategory
					coverageByCategory={coverageGainedByCategory}
					prefix="+"
				/>
			</div>

			<ReviewAnswers answered={answered} />
		</div>
	);
};

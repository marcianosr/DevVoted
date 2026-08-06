import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import {
	gateRewardRows,
	gateStorageGained,
} from "~/modules/run/gate/gateReward.model";
import {
	swatchesEarnedAt,
	swatchForGate,
} from "~/modules/run/gate/swatch.model";
import { roundToOneDecimal, STORAGE_CAP_KB } from "~/modules/run/rules.model";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { GateRewardReport } from "../gate/GateRewardReport.ui";
import { SwatchChips } from "../gate/SwatchChips.ui";
import { CoverageByCategory } from "../run/CoverageByCategory.ui";
import { ReviewAnswers } from "../run/ReviewAnswers.ui";

type RewardScreenProps = {
	/** The gate the clear beat — one behind `gatesCleared`, which it advanced. */
	clearedGate: number;
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
	clearedGate,
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
	// This clear banked gate `clearedGate`, so every swatch up to and including
	// it is now held — no separate width or count needs passing in.
	const earnedSwatches = swatchesEarnedAt(clearedGate + 1);

	return (
		<div className="flex flex-col gap-4">
			<GateRewardReport
				gateNumber={clearedGate}
				cleared
				earnedSwatch={swatchForGate(clearedGate)}
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

			{earnedSwatches.length > 0 && (
				<section className="flex flex-col items-center gap-2">
					<Subtitle>Swatches collected</Subtitle>
					<SwatchChips swatches={earnedSwatches} />
				</section>
			)}

			<ReviewAnswers answered={answered} />
		</div>
	);
};

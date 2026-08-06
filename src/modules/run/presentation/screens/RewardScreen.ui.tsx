import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import {
	gateRewardRows,
	gateStorageGained,
} from "~/modules/run/gate/gateReward.model";
import {
	swatchesEarnedAt,
	swatchForSlot,
} from "~/modules/run/pipeline/swatch.model";
import { roundToOneDecimal, STORAGE_CAP_KB } from "~/modules/run/rules.model";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { GateRewardReport } from "../gate/GateRewardReport.ui";
import { SwatchChips } from "../gate/SwatchChips.ui";
import { CoverageByCategory } from "../run/CoverageByCategory.ui";
import { ReviewAnswers } from "../run/ReviewAnswers.ui";

type RewardScreenProps = {
	/** The gate the clear actually beat — not `gatesCleared`, which the gate–slot cap can freeze behind it. */
	clearedGate: number;
	/** Pipeline width, which names the swatches collected so far. */
	slots?: number;
	/** The clear passed but the climb stays on this gate — the pipeline is too narrow. */
	heldAtGate?: boolean;
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
	slots,
	heldAtGate = false,
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
	const earnedSwatches = slots === undefined ? [] : swatchesEarnedAt(slots);
	// A held clear is always exactly one slot short: running this gate already
	// required every slot below it (ADR-018).
	const unlockSwatch =
		slots === undefined ? undefined : swatchForSlot(slots + 1);
	const held =
		heldAtGate && slots !== undefined && unlockSwatch
			? {
					nextGate: clearedGate + 1,
					unlockSlot: unlockSwatch.slot,
					swatchName: unlockSwatch.name,
				}
			: undefined;

	return (
		<div className="flex flex-col gap-4">
			<GateRewardReport
				gateNumber={clearedGate}
				cleared
				held={held}
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

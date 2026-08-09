import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import {
	gateRewardRows,
	gateStorageGained,
} from "~/modules/run/gate/gateReward.model";
import {
	ALL_SWATCHES,
	swatchesEarnedAt,
	swatchForGate,
} from "~/modules/run/gate/swatch.model";
import {
	roundToOneDecimal,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/rules.model";
import { Button } from "~/ui/Button.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { GateRewardReport } from "../gate/GateRewardReport.ui";
import { nextSlotProgress } from "../gate/SlotUnlockRow.ui";
import { CoverageByCategory } from "../run/CoverageByCategory.ui";
import { GateSegmentBar } from "../run/GateSegmentBar.ui";

type RewardScreenProps = {
	clearedGate: number;
	gateReward: number;
	answered: readonly AnsweredPoll[];
	coverageGainedByCategory: Readonly<Record<string, number>>;
	passedChecks: readonly CheckStatus[];
	configs: readonly Config[];
	faucetThisGateKb?: number;
	storage?: number;
	capKb?: number;
	coverage?: number;
	slotCoverageRequired?: number;
	slots?: number;
	billKb?: number;
	planDowngraded?: boolean;
	onReviewAnswers?: () => void;
	onContinue?: () => void;
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
	capKb,
	coverage,
	slotCoverageRequired,
	slots,
	billKb,
	planDowngraded,
	onReviewAnswers,
	onContinue,
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
	const earnedSwatches = swatchesEarnedAt(clearedGate + 1);

	const buysNextSlot =
		coverage !== undefined &&
		slots !== undefined &&
		slotCoverageRequired !== undefined &&
		Number.isFinite(slotCoverageRequired) &&
		slotCoverageRequired > 0;

	const gatesCleared = clearedGate + 1;
	const nextGate = swatchForGate(gatesCleared);

	return (
		<div className="flex flex-col gap-4">
			<GateRewardReport
				gateNumber={clearedGate}
				cleared
				swatch={swatchForGate(clearedGate)}
				rows={rows}
				totals={{ storageKb, coveragePct }}
				storageBar={
					storage === undefined || capKb === undefined
						? undefined
						: {
								fromKb: Math.max(0, storage - storageKb),
								toKb: storage,
								capKb,
							}
				}
				coverageBar={buysNextSlot ? { toPct: coverage } : undefined}
				swatchProgress={{
					earned: earnedSwatches.length,
					total: ALL_SWATCHES.length,
				}}
				slotRow={
					slots === undefined
						? null
						: nextSlotProgress({ slots, coverage, slotCoverageRequired })
				}
				climb={{
					ladder: (
						<GateSegmentBar
							swatches={ALL_SWATCHES}
							gatesCleared={gatesCleared}
							pollsAnswered={0}
							pollsPerGate={SLICE_WINDOW}
							label={`gate ${gatesCleared} of ${VICTORY_GATE}`}
						/>
					),
					caption:
						gatesCleared > VICTORY_GATE
							? `gate ${VICTORY_GATE} of ${VICTORY_GATE} — the summit`
							: `gate ${gatesCleared} of ${VICTORY_GATE}${
									nextGate ? ` · next up: ${nextGate.gateName} gate` : ""
								}`,
				}}
				breakdown={
					<CoverageByCategory
						coverageByCategory={coverageGainedByCategory}
						title="Coverage by category"
						prefix="+"
					/>
				}
			/>

			{billKb !== undefined && billKb > 0 ? (
				<Paragraph size="sm" tone="muted">
					Storage plan billed −{billKb}KB this window.
				</Paragraph>
			) : null}
			{planDowngraded ? (
				<Paragraph size="sm" tone="cinnabar">
					Storage bill unpaid — downgraded to the free tier.
				</Paragraph>
			) : null}

			{(answered.length > 0 && onReviewAnswers) || onContinue ? (
				<div className="flex items-center justify-end gap-3">
					{answered.length > 0 && onReviewAnswers ? (
						<Button variant="neutral" onClick={onReviewAnswers}>
							Review your answers →
						</Button>
					) : null}
					{onContinue ? (
						<Button onClick={onContinue}>Continue to shop →</Button>
					) : null}
				</div>
			) : null}
		</div>
	);
};

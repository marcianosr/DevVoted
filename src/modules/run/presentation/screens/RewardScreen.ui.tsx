import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import {
	correctCount,
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
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { GateRewardReport } from "../gate/GateRewardReport.ui";
import { nextSlotProgress } from "../gate/SlotUnlockRow.ui";
import { SwatchChips } from "../gate/SwatchChips.ui";
import { CoverageByCategory } from "../run/CoverageByCategory.ui";
import { GateSegmentBar } from "../run/GateSegmentBar.ui";

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
	/** The cap in KB at the time this reward was received — the bar's upper limit. */
	capKb?: number;
	/** The run's coverage after the payout — drawn as the coverage bar. */
	coverage?: number;
	/**
	 * Coverage the next slot costs, and which slot that is. Coverage buys width,
	 * so this is what its bar fills toward (ADR-019). Infinite at the slot cap,
	 * where the bar drops rather than filling toward nothing.
	 */
	slotCoverageRequired?: number;
	slots?: number;
	/** What the storage plan billed when this window closed — 0/omitted on the free tier. */
	billKb?: number;
	/** True when the bill went unpaid and the plan dropped to the free tier. */
	planDowngraded?: boolean;
	/** Opens the review page. Omit and the score line stays off the screen. */
	onReviewAnswers?: () => void;
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

	// The rung coverage is paying for. A finite requirement is the only case with
	// something to fill toward: at the slot cap `coverageToAddSlot` is Infinity,
	// and a bar against infinity would read as "you have made no progress".
	const buysNextSlot =
		coverage !== undefined &&
		slots !== undefined &&
		slotCoverageRequired !== undefined &&
		Number.isFinite(slotCoverageRequired) &&
		slotCoverageRequired > 0;

	// A rung crossed *by this gate* is the news; a rung crossed two gates ago and
	// left unspent is not, so the before-value is what decides. The slot itself is
	// still claimed in the shop — the reward screen only reports that it opened.
	const openedSlot =
		buysNextSlot &&
		coverage >= slotCoverageRequired &&
		coverage - coveragePct < slotCoverageRequired;

	// The climb after this clear: gates count from 0, so the gate just banked
	// makes `clearedGate + 1` both the gates-cleared count and the gate now under
	// way — the same number the HUD's ladder reads.
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
				coverageBar={
					buysNextSlot
						? {
								fromPct: roundToOneDecimal(coverage - coveragePct),
								toPct: coverage,
								targetPct: slotCoverageRequired,
								targetLabel: `slot ${slots + 1}`,
								reached: openedSlot,
							}
						: undefined
				}
				swatchProgress={{
					earned: earnedSwatches.length,
					total: ALL_SWATCHES.length,
				}}
				// Read-only: the reward screen reports that width opened, the shop is
				// where it is claimed. `nextSlotProgress` returns nothing at the slot cap.
				slotRow={
					slots === undefined
						? null
						: nextSlotProgress({ slots, coverage, slotCoverageRequired })
				}
				climb={{
					ladder: (
						// The same ladder the HUD carries, so the badge you just won is
						// visibly the pip that filled. No polls answered yet in the new
						// window — the next gate opens tomorrow.
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
				// Where the coverage number came from — the section that closes the
				// payout, under its own rule.
				breakdown={
					<CoverageByCategory
						coverageByCategory={coverageGainedByCategory}
						title="Coverage by category"
						prefix="+"
					/>
				}
			/>

			{/* The plan's receipt: a bill is silent income shrinkage unless named. */}
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

			{earnedSwatches.length > 0 && (
				<section className="flex flex-col items-start gap-2">
					<Subtitle>Swatches collected</Subtitle>
					<SwatchChips swatches={earnedSwatches} />
				</section>
			)}

			{/* The answers themselves live on their own page; what belongs here is the
			    score, which is the gate's report card — and the way through to them. */}
			{answered.length > 0 && onReviewAnswers ? (
				<button
					type="button"
					onClick={onReviewAnswers}
					className="flex cursor-pointer items-center gap-3 self-start rounded-lg border border-zinc-700 px-3 py-2 text-left transition-colors hover:bg-zinc-900/60"
				>
					<Paragraph as="span" size="sm">
						Review your answers
					</Paragraph>
					<Paragraph
						as="span"
						size="sm"
						tone="viridian"
						className="font-bold tabular-nums"
					>
						{correctCount(answered)} of {answered.length} correct
					</Paragraph>
					<Paragraph as="span" size="sm" tone="muted">
						→
					</Paragraph>
				</button>
			) : null}
		</div>
	);
};

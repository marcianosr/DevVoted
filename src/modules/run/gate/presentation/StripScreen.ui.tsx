import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { gateRewardRows } from "~/modules/run/gate/domain/gateReward.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { GateRewardReport } from "~/modules/run/gate/presentation/GateRewardReport.ui";
import { GateStakeReceipt } from "~/modules/run/gate/presentation/GateStakeReceipt.ui";
import type { GateStake } from "~/modules/run/run/application/runView.viewmodel";

type StripScreenProps = {
	stripsRemaining: number;
	gateNumber: number;
	configs: readonly Config[];
	/** Feeds the report's per-config rows — the answers themselves live on /run/review. */
	answered: readonly AnsweredPoll[];
	/** What the storage plan billed when the failed window closed — 0/omitted on the free tier. */
	billKb?: number;
	/** True when the bill went unpaid and the plan dropped to the free tier. */
	planDowngraded?: boolean;
	/**
	 * The same gate again, since a miss replays it. Peeling toward a bare build
	 * is the reason this screen is a decision: the last config is the run.
	 */
	retryStake?: GateStake;
	onStrip: (configId: string) => void;
};

/**
 * A missed gate's report and its price (ADR-037): what the build did over the
 * five polls, and which configs to peel before the loop opens again. It asks the
 * player for one decision, so it shows only what that decision needs — the
 * answers moved to the review page, the same way they left the reward screen.
 */
export const StripScreen = ({
	stripsRemaining,
	gateNumber,
	configs,
	answered,
	billKb,
	planDowngraded,
	retryStake,
	onStrip,
}: StripScreenProps) => {
	const quotaMet = stripsRemaining === 0;
	const removableConfigIds = quotaMet ? [] : configs.map((config) => config.id);

	return (
		<div className="flex flex-col gap-4">
			<GateRewardReport
				gateNumber={gateNumber}
				cleared={false}
				// Names the failure after the gate too ("Thunder gate failed!"); the
				// red FAIL badge stays, since a failure needs no colour of its own.
				swatch={swatchForGate(gateNumber)}
				rows={gateRewardRows({ answered, configs })}
				removableConfigIds={removableConfigIds}
				onRemoveConfig={onStrip}
				stripsRemaining={stripsRemaining}
			/>
			{/* A failed gate pays nothing and still bills — the plan's receipt
			    belongs where that sting lands. */}
			{billKb !== undefined && billKb > 0 ? (
				<Paragraph size="sm" tone="muted">
					Storage plan billed −{billKb}KB this window — pass or fail.
				</Paragraph>
			) : null}
			{planDowngraded ? (
				<Paragraph size="sm" tone="cinnabar">
					Storage bill unpaid — downgraded to the free tier.
				</Paragraph>
			) : null}
			{/* Reads live against `configs`, so the floor updates as the player peels
			    — the warning arrives while the choice is still open. */}
			{retryStake ? <GateStakeReceipt stake={retryStake} lead="Retry" /> : null}
		</div>
	);
};

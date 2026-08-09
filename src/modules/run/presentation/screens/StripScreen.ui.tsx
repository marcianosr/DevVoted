import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { gateRewardRows } from "~/modules/run/gate/gateReward.model";
import { swatchForGate } from "~/modules/run/gate/swatch.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { GateRewardReport } from "../gate/GateRewardReport.ui";

type StripScreenProps = {
	stripsRemaining: number;
	gateNumber: number;
	configs: readonly Config[];
	checks: readonly CheckStatus[];
	/** Feeds the report's per-config rows — the answers themselves live on /run/review. */
	answered: readonly AnsweredPoll[];
	/** What the storage plan billed when the failed window closed — 0/omitted on the free tier. */
	billKb?: number;
	/** True when the bill went unpaid and the plan dropped to the free tier. */
	planDowngraded?: boolean;
	onStrip: (configId: string) => void;
};

/**
 * The gate-failed repair step: what broke, and which configs to peel. It asks
 * the player for one decision, so it shows only what that decision needs — the
 * answers moved to the review page, the same way they left the reward screen.
 * Reading five questions is study; choosing what to sacrifice is not.
 */
export const StripScreen = ({
	stripsRemaining,
	gateNumber,
	configs,
	checks,
	answered,
	billKb,
	planDowngraded,
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
				rows={gateRewardRows({ answered, configs, checks })}
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
		</div>
	);
};

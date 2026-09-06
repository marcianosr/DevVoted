import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { gateRewardRows } from "~/modules/run/gate/domain/gateReward.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { GateRewardReport } from "~/modules/run/gate/presentation/GateRewardReport.ui";
import { GateStakeReceipt } from "~/modules/run/gate/presentation/GateStakeReceipt.ui";
import type { GateStake } from "~/modules/run/run/application/gateStake.viewmodel";
import { peelRefundIn } from "~/modules/run/run/domain/strip.model";

type StripScreenProps = {
	peelSlotsRemaining: number;
	peelWaived?: boolean;
	gateNumber: number;
	configs: readonly Config[];
	answered: readonly AnsweredPoll[];
	peelRefundKb?: number;
	estimateThisGateKb?: number;
	retryStake?: GateStake;
	onStrip: (configId: string) => void;
};

const refundQuotes = (
	configs: readonly Config[]
): Readonly<Record<string, number>> =>
	Object.fromEntries(
		configs.map((config) => [config.id, peelRefundIn(configs, config)])
	);

export const StripScreen = ({
	peelSlotsRemaining,
	peelWaived,
	gateNumber,
	configs,
	answered,
	peelRefundKb,
	estimateThisGateKb,
	retryStake,
	onStrip,
}: StripScreenProps) => {
	const quotaMet = peelSlotsRemaining === 0;
	const removableConfigIds = quotaMet ? [] : configs.map((config) => config.id);

	return (
		<div className="flex flex-col gap-4">
			<GateRewardReport
				gateNumber={gateNumber}
				cleared={false}
				swatch={swatchForGate(gateNumber)}
				rows={gateRewardRows({
					answered,
					configs,
					peelRefundKb,
					estimateThisGateKb,
				})}
				removableConfigIds={removableConfigIds}
				removalRefundKb={refundQuotes(configs)}
				onRemoveConfig={onStrip}
				peelSlotsRemaining={peelSlotsRemaining}
				peelWaived={peelWaived}
			/>
			{retryStake ? <GateStakeReceipt stake={retryStake} lead="Retry" /> : null}
		</div>
	);
};

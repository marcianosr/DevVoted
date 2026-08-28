import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { gateRewardRows } from "~/modules/run/gate/domain/gateReward.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { GateRewardReport } from "~/modules/run/gate/presentation/GateRewardReport.ui";
import { GateStakeReceipt } from "~/modules/run/gate/presentation/GateStakeReceipt.ui";
import type { GateStake } from "~/modules/run/run/application/gateStake.viewmodel";

type StripScreenProps = {
	peelSpotsRemaining: number;
	gateNumber: number;
	configs: readonly Config[];
	answered: readonly AnsweredPoll[];
	retryStake?: GateStake;
	onStrip: (configId: string) => void;
};

export const StripScreen = ({
	peelSpotsRemaining,
	gateNumber,
	configs,
	answered,
	retryStake,
	onStrip,
}: StripScreenProps) => {
	const quotaMet = peelSpotsRemaining === 0;
	const removableConfigIds = quotaMet ? [] : configs.map((config) => config.id);

	return (
		<div className="flex flex-col gap-4">
			<GateRewardReport
				gateNumber={gateNumber}
				cleared={false}
				swatch={swatchForGate(gateNumber)}
				rows={gateRewardRows({ answered, configs })}
				removableConfigIds={removableConfigIds}
				onRemoveConfig={onStrip}
				peelSpotsRemaining={peelSpotsRemaining}
			/>
			{retryStake ? <GateStakeReceipt stake={retryStake} lead="Retry" /> : null}
		</div>
	);
};

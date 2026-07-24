import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { gateRewardRows } from "~/modules/run/gate/gateReward.model";
import { GateRewardReport } from "../gate/GateRewardReport.ui";
import { ReviewAnswers } from "../run/ReviewAnswers.ui";

type StripScreenProps = {
	stripsRemaining: number;
	gateNumber: number;
	configs: readonly Config[];
	checks: readonly CheckStatus[];
	answered: readonly AnsweredPoll[];
	onStrip: (configId: string) => void;
};

export const StripScreen = ({
	stripsRemaining,
	gateNumber,
	configs,
	checks,
	answered,
	onStrip,
}: StripScreenProps) => {
	const quotaMet = stripsRemaining === 0;
	const removableConfigIds = quotaMet
		? []
		: configs.filter((config) => !config.fixed).map((config) => config.id);

	return (
		<div className="flex flex-col gap-6">
			<GateRewardReport
				gateNumber={gateNumber}
				cleared={false}
				rows={gateRewardRows({ answered, configs, checks })}
				removableConfigIds={removableConfigIds}
				onRemoveConfig={onStrip}
				stripsRemaining={stripsRemaining}
				configs={configs}
			/>

			<ReviewAnswers answered={answered} />
		</div>
	);
};

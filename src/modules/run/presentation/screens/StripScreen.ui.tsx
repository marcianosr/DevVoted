import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { gateRewardRows } from "~/modules/run/gate/gateReward.model";
import { swatchForGate } from "~/modules/run/gate/swatch.model";
import { GateRewardReport } from "../gate/GateRewardReport.ui";

type StripScreenProps = {
	stripsRemaining: number;
	gateNumber: number;
	configs: readonly Config[];
	checks: readonly CheckStatus[];
	/** Feeds the report's per-config rows — the answers themselves live on /run/review. */
	answered: readonly AnsweredPoll[];
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
	onStrip,
}: StripScreenProps) => {
	const quotaMet = stripsRemaining === 0;
	const removableConfigIds = quotaMet ? [] : configs.map((config) => config.id);

	return (
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
	);
};

import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";

import { RewardScreen } from "~/modules/run/gate/presentation/RewardScreen.ui";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunReward = () => {
	const { view } = useTodaysRun();
	const navigate = useNavigate();

	if (!view) return null;

	return (
		<Screen theme="celadon">
			<RewardScreen
				clearedGate={view.clearedGateNumber}
				gateReward={view.gateRewardPaidKb}
				answered={view.answeredThisGate}
				configs={view.configs}
				storage={view.storage}
				capKb={view.storageCap}
				faucetThisGateKb={view.faucetThisGateKb}
				interestThisGateKb={view.interestThisGateKb}
				extraPickThisGateKb={view.extraPickThisGateKb}
				billKb={view.gateBillPaidKb}
				planDowngraded={view.planDowngraded}
				autoUpgraded={view.autoUpgradedConfig ?? undefined}
				deletedConfigs={view.deletedConfigs}
				lapsedConfigs={view.lapsedConfigs}
				subscriptionBillKb={view.subscriptionBillKb}
				nextStake={view.gateStake}
				onReviewAnswers={() => navigate({ to: "/run/review" })}
				onContinue={() => navigate({ to: "/run/shop" })}
			/>
		</Screen>
	);
};

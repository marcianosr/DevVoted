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
				clearedGate={view.gatePayout.clearedGateNumber}
				gateReward={view.gatePayout.gateRewardPaidKb}
				answered={view.answeredThisGate}
				configs={view.configs}
				storage={view.storage}
				capKb={view.storageCap}
				faucetThisGateKb={view.gatePayout.faucetThisGateKb}
				interestThisGateKb={view.gatePayout.interestThisGateKb}
				extraPickThisGateKb={view.gatePayout.extraPickThisGateKb}
				billKb={view.gatePayout.gateBillPaidKb}
				planDowngraded={view.gatePayout.planDowngraded}
				autoUpgraded={view.gatePayout.autoUpgradedConfig ?? undefined}
				deletedConfigs={view.gatePayout.deletedConfigs}
				lapsedConfigs={view.gatePayout.lapsedConfigs}
				subscriptionBillKb={view.gatePayout.subscriptionBillKb}
				nextStake={view.gateStake}
				onReviewAnswers={() => navigate({ to: "/run/review" })}
				onContinue={() => navigate({ to: "/run/shop" })}
			/>
		</Screen>
	);
};

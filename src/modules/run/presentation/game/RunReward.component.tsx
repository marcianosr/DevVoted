import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";

import { RewardScreen } from "../screens/RewardScreen.ui";
import { useTodaysRun } from "./useTodaysRun.hook";

export const RunReward = () => {
	const { view } = useTodaysRun();
	const navigate = useNavigate();

	if (!view) return null;

	return (
		<Screen
			theme="celadon"
			rightAction={{
				label: "Continue to shop →",
				onClick: () => navigate({ to: "/run/shop" }),
			}}
		>
			<RewardScreen
				clearedGate={view.clearedGateNumber}
				slots={view.slots}
				heldAtGate={view.heldAtGate}
				gateReward={view.gateRewardPaidKb}
				answered={view.answeredThisGate}
				coverageGainedByCategory={view.coverageGainedThisGate}
				passedChecks={view.passedChecks}
				configs={view.configs}
				faucetThisGateKb={view.faucetThisGateKb}
				storage={view.storage}
			/>
		</Screen>
	);
};

import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";

import { RewardScreen } from "../screens/RewardScreen.ui";
import { useTodaysRun } from "./useTodaysRun.hook";

/** Tier 2: the gate-cleared summary — first page of the reward flow. */
export const RunReward = () => {
	const { view } = useTodaysRun();
	const navigate = useNavigate();

	if (!view) return null;

	return (
		<Screen
			theme="celadon"
			rightAction={{
				label: "Continue →",
				onClick: () => navigate({ to: "/run/shop" }),
			}}
		>
			<RewardScreen
				gatesCleared={view.gatesCleared}
				gateReward={view.gateReward}
				answered={view.answeredThisGate}
				coverageGainedByCategory={view.coverageGainedThisGate}
				passedChecks={view.passedChecks}
				configs={view.configs}
				faucetThisGateKb={view.faucetThisGateKb}
			/>
		</Screen>
	);
};

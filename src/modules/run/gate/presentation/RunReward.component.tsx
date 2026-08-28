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
				payout={view.gatePayout}
				answered={view.answeredThisGate}
				configs={view.configs}
				storage={view.storage}
				nextStake={view.gateStake}
				onReviewAnswers={() => navigate({ to: "/run/review" })}
				onContinue={() => navigate({ to: "/run/shop" })}
			/>
		</Screen>
	);
};

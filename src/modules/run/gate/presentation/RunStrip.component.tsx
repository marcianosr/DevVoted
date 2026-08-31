import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";

import { StripScreen } from "~/modules/run/gate/presentation/StripScreen.ui";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunStrip = () => {
	const { view } = useTodaysRun();
	const { send } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	const quotaMet = view.peelSlotsRemaining === 0;

	return (
		<Screen
			theme="cinnabar"
			rightAction={{
				label: "Review answers →",
				onClick: () => navigate({ to: "/run/review" }),
				disabled: !quotaMet,
				hint: quotaMet
					? undefined
					: `Peel ${view.peelSlotsRemaining} more config${view.peelSlotsRemaining === 1 ? "" : "s"} to continue`,
			}}
		>
			<StripScreen
				peelSlotsRemaining={view.peelSlotsRemaining}
				gateNumber={view.gatesCleared}
				configs={view.configs}
				answered={view.answeredThisGate}
				retryStake={view.gateStake}
				onStrip={(id) => send({ type: "strip", configId: id })}
			/>
		</Screen>
	);
};

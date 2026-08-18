import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";

import { StripScreen } from "~/modules/run/gate/presentation/StripScreen.ui";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

/** Tier 2: the missed gate's peel — drop the quota, then run the loop again. */
export const RunStrip = () => {
	const { view } = useTodaysRun();
	const { send } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	const quotaMet = view.stripsRemaining === 0;

	// Strip → Review: peeling the pipeline is the whole job of this screen, so it
	// hands off rather than resuming. The action that actually restarts the climb
	// waits on the review page, the last beat of the failed gate.
	return (
		<Screen
			theme="cinnabar"
			rightAction={{
				label: "Review answers →",
				onClick: () => navigate({ to: "/run/review" }),
				disabled: !quotaMet,
				hint: quotaMet
					? undefined
					: `Peel ${view.stripsRemaining} more config${view.stripsRemaining === 1 ? "" : "s"} to continue`,
			}}
		>
			<StripScreen
				stripsRemaining={view.stripsRemaining}
				gateNumber={view.gatesCleared}
				configs={view.configs}
				answered={view.answeredThisGate}
				billKb={view.gateBillPaidKb}
				planDowngraded={view.planDowngraded}
				retryStake={view.gateStake}
				onStrip={(id) => send({ type: "strip", configId: id })}
			/>
		</Screen>
	);
};

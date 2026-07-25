import { Screen } from "~/ui/Screen.ui";

import { StripScreen } from "../screens/StripScreen.ui";
import { useRunActions } from "./useRunActions.hook";
import { useTodaysRun } from "./useTodaysRun.hook";

/** Tier 2: the gate-failed repair step — remove pipelines to climb on. */
export const RunStrip = () => {
	const { view } = useTodaysRun();
	const { send, busy } = useRunActions();

	if (!view) return null;

	const quotaMet = view.stripsRemaining === 0;

	return (
		<Screen
			theme="cinnabar"
			rightAction={{
				label: "Climb on →",
				onClick: () => send({ type: "resume-climb" }),
				disabled: !quotaMet || busy,
				hint: quotaMet
					? undefined
					: `Remove ${view.stripsRemaining} pipeline(s) to continue`,
			}}
		>
			<StripScreen
				stripsRemaining={view.stripsRemaining}
				gateNumber={view.gatesCleared + 1}
				configs={view.configs}
				checks={view.checks}
				answered={view.answeredThisGate}
				onStrip={(id) => send({ type: "strip", configId: id })}
			/>
		</Screen>
	);
};

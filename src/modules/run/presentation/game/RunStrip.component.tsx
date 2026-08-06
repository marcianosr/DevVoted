import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";

import { StripScreen } from "../screens/StripScreen.ui";
import { useRunActions } from "./useRunActions.hook";
import { useTodaysRun } from "./useTodaysRun.hook";

/** Tier 2: the gate-failed repair step — remove pipelines to climb on. */
export const RunStrip = () => {
	const { view } = useTodaysRun();
	const { send, sendWith, commit, busy } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	const quotaMet = view.stripsRemaining === 0;

	// Strip → Community: the failure path takes the same community
	// detour as the shop — commit the repair, then step outside the layout.
	// The climb resumes from the community page ("Climb on →").
	const resumeToCommunity = () =>
		sendWith({ type: "resume-climb" }, (result) => {
			if (!result.success) return;
			commit(result);
			navigate({ to: "/run/community" });
		});

	return (
		<Screen
			theme="cinnabar"
			rightAction={{
				label: "Community →",
				onClick: resumeToCommunity,
				disabled: !quotaMet || busy,
				hint: quotaMet
					? undefined
					: `Remove ${view.stripsRemaining} pipeline(s) to continue`,
			}}
		>
			<StripScreen
				stripsRemaining={view.stripsRemaining}
				gateNumber={view.gatesCleared}
				configs={view.configs}
				checks={view.checks}
				answered={view.answeredThisGate}
				onStrip={(id) => send({ type: "strip", configId: id })}
			/>
		</Screen>
	);
};

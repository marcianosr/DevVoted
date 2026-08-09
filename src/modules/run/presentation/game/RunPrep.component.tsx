import { useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";

import { PrepScreen } from "../screens/PrepScreen.ui";
import { useRunActions } from "./useRunActions.hook";
import { useTodaysRun } from "./useTodaysRun.hook";

/** Tier 2: the gate-prep beat between the community board and the first poll. */
export const RunPrep = () => {
	const { view } = useTodaysRun();
	const { send } = useRunActions();
	const navigate = useNavigate();
	const [editing, setEditing] = useState(false);

	if (!view) return null;

	return (
		<Screen gateTheme={view.gateTheme}>
			<PrepScreen
				gateNumber={view.gatesCleared}
				pollsPerGate={view.pollsPerGate}
				stripsOnFailure={view.stripsOnFailure}
				storageBillKb={view.storageBillKb}
				modifiers={{
					gateReward: view.gateReward,
					rewardMultiplier: view.rewardMultiplier,
					coverageMultiplier: view.coverageMultiplier,
					coverageAdd: view.coverageAdd,
				}}
				configs={view.configs}
				editing={editing}
				onDropConfig={(configId) => send({ type: "drop", configId })}
				onEditPipeline={() => setEditing((current) => !current)}
				onStartGate={() => navigate({ to: "/run/answer" })}
			/>
		</Screen>
	);
};

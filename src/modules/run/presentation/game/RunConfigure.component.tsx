import { Screen } from "~/ui/Screen.ui";

import { ConfiguringScreen } from "../screens/ConfiguringScreen.ui";
import { useRunActions } from "./useRunActions.hook";
import { useTodaysRun } from "./useTodaysRun.hook";

/** Tier 2: build the loadout before the climb starts. */
export const RunConfigure = () => {
	const { view } = useTodaysRun();
	const { send, busy } = useRunActions();

	if (!view) return null;

	// Mirrors the engine's start guard: the climb only begins on a full pipeline.
	const slotsLeft = view.slots - view.configs.length;
	const canStart = slotsLeft <= 0;

	return (
		<Screen
			rightAction={{
				label: "Start run →",
				onClick: () => send({ type: "start" }),
				disabled: !canStart || busy,
				hint: canStart ? undefined : "Select a config for every pipeline slot",
			}}
		>
			<ConfiguringScreen
				configs={view.configs}
				slots={view.slots}
				gatesCleared={view.gatesCleared}
				bench={view.available}
				checks={view.checks}
				gateReward={view.gateReward}
				rewardMultiplier={view.rewardMultiplier}
				coverageMultiplier={view.coverageMultiplier}
				coverageAdd={view.coverageAdd}
				coverage={view.coverage}
				slotCoverageRequired={view.slotCoverageRequired}
				onSlot={(id) => send({ type: "slot", configId: id })}
				onUnslot={(id) => send({ type: "unslot", configId: id })}
			/>
		</Screen>
	);
};

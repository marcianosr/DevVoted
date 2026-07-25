import { Screen } from "~/ui/Screen.ui";

import { ConfiguringScreen } from "../screens/ConfiguringScreen.ui";
import { useRunActions } from "./useRunActions.hook";
import { useTodaysRun } from "./useTodaysRun.hook";

/** Tier 2: build the loadout before the climb starts. */
export const RunConfigure = () => {
	const { view } = useTodaysRun();
	const { send, busy } = useRunActions();

	if (!view) return null;

	const canStart = view.configs.some((config) => !config.fixed);

	return (
		<Screen
			rightAction={{
				label: "Start run →",
				onClick: () => send({ type: "start" }),
				disabled: !canStart || busy,
				hint: canStart ? undefined : "Choose a config to start",
			}}
		>
			<ConfiguringScreen
				configs={view.configs}
				slots={view.slots}
				bench={view.available}
				checks={view.checks}
				gateReward={view.gateReward}
				rewardMultiplier={view.rewardMultiplier}
				coverageMultiplier={view.coverageMultiplier}
				coverageAdd={view.coverageAdd}
				onSlot={(id) => send({ type: "slot", configId: id })}
				onUnslot={(id) => send({ type: "unslot", configId: id })}
			/>
		</Screen>
	);
};

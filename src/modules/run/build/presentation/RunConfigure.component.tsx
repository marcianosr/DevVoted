import { STARTER_STACKS } from "~/modules/run/config/domain/stack.model";
import { Screen } from "~/ui/Screen.ui";
import { setScreenNavDirection } from "~/ui/screenNavDirection";

import { ConfiguringScreen } from "~/modules/run/build/presentation/ConfiguringScreen.ui";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunConfigure = () => {
	const { view } = useTodaysRun();
	const { send, busy } = useRunActions();

	if (!view) return null;

	return (
		<Screen gateTheme={view.gateTheme}>
			<ConfiguringScreen
				configs={view.configs}
				slots={view.slots}
				slotsUsed={view.slotsUsed}
				slotsFree={view.slotsFree}
				overflowSlots={view.overflowSlots}
				stake={view.gateStake}
				bench={view.available}
				onInstall={(id) => send({ type: "install", configId: id })}
				onUninstall={(id) => send({ type: "uninstall", configId: id })}
				stacks={STARTER_STACKS}
				onPickStack={(stackId) => send({ type: "pick-stack", stackId })}
				startAction={{
					label: "Start run →",
					onClick: () => {
						setScreenNavDirection("forward");
						send({ type: "start" });
					},
					disabled: !view.canStart || busy,
					hint: view.canStart ? undefined : "Pick a stack to start",
				}}
			/>
		</Screen>
	);
};

import { Screen } from "~/ui/Screen.ui";
import { setScreenNavDirection } from "~/ui/screenNavDirection";

import { ConfiguringScreen } from "~/modules/run/build/presentation/ConfiguringScreen.ui";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunConfigure = () => {
	const { view } = useTodaysRun();
	const { send, busy } = useRunActions();

	if (!view) return null;

	const installed = new Set(view.configs.map((config) => config.id));

	return (
		<Screen gateTheme={view.gateTheme}>
			<ConfiguringScreen
				configs={view.configs}
				slots={view.slots}
				slotsUsed={view.slotsUsed}
				slotsFree={view.slotsFree}
				stake={view.gateStake}
				bench={view.available.filter((config) => !installed.has(config.id))}
				recommended={view.recommendedConfigIds}
				onInstall={(id) => send({ type: "install", configId: id })}
				onUninstall={(id) => send({ type: "uninstall", configId: id })}
				startAction={{
					label: "Start run →",
					onClick: () => {
						setScreenNavDirection("forward");
						send({ type: "start" });
					},
					disabled: !view.canStart || busy,
					hint: view.canStart ? undefined : "Pick a config to start",
				}}
			/>
		</Screen>
	);
};

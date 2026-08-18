import { STARTER_STACKS } from "~/modules/run/config/domain/stack.model";
import { Screen } from "~/ui/Screen.ui";
import { setScreenNavDirection } from "~/ui/screenNavDirection";

import { ConfiguringScreen } from "~/modules/run/pipeline/presentation/ConfiguringScreen.ui";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

/** Tier 2: build the loadout before the climb starts. */
export const RunConfigure = () => {
	const { view } = useTodaysRun();
	const { send, busy } = useRunActions();

	if (!view) return null;

	return (
		<Screen gateTheme={view.gateTheme}>
			<ConfiguringScreen
				configs={view.configs}
				slots={view.slots}
				stake={view.gateStake}
				bench={view.available}
				onSlot={(id) => send({ type: "slot", configId: id })}
				onUnslot={(id) => send({ type: "unslot", configId: id })}
				stacks={STARTER_STACKS}
				onPickStack={(stackId) => send({ type: "pick-stack", stackId })}
				startAction={{
					label: "Start run →",
					onClick: () => {
						// The receipt carries this CTA itself now (moved inside "Build
						// Summary", Marciano 2026-08-11), so it — not Screen's own footer —
						// is what fires the forward transition for the next screen.
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

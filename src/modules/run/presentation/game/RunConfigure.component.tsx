import { STARTER_STACKS } from "~/modules/run/configs/stack.model";
import { perAnswerPreviewFor } from "~/modules/run/pipeline/pipeline.model";
import { Screen } from "~/ui/Screen.ui";
import { setScreenNavDirection } from "~/ui/screenNavDirection";

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
		<Screen gateTheme={view.gateTheme}>
			<ConfiguringScreen
				configs={view.configs}
				slots={view.slots}
				gatesCleared={view.gatesCleared}
				pollsPerGate={view.pollsPerGate}
				stripsOnFailure={view.stripsOnFailure}
				modifiers={{
					gateReward: view.gateReward,
					rewardMultiplier: view.rewardMultiplier,
					coverageMultiplier: view.coverageMultiplier,
					coverageAdd: view.coverageAdd,
				}}
				perAnswer={perAnswerPreviewFor(view.configs, view.gatesCleared)}
				bench={view.available}
				checks={view.checks}
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
					disabled: !canStart || busy,
					hint: canStart ? undefined : "Pick a stack to start",
				}}
			/>
		</Screen>
	);
};

import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { RunReadoutProps } from "~/ui/kanto-theme/RunReadout.ui";

export const runReadoutFor = (
	view: RunView,
	runNumber: number | null
): RunReadoutProps => ({
	runNumber,
	gate: view.gatesCleared,
	gates: view.victoryGate,
});

import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { RunReadoutProps } from "~/modules/run/run/presentation/RunReadout.ui";

export const runReadoutFor = (
	view: RunView,
	runNumber: number | null
): RunReadoutProps => ({
	runNumber,
	gate: view.gatesCleared,
	gates: view.victoryGate,
});

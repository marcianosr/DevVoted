import { closedBarFor } from "~/modules/run/gate/application/gateOutcome.viewmodel";
import {
	type RunOverFrame,
	runOverPropsFor,
} from "~/modules/run/run/application/runOverScreen.viewmodel";
import { runPaidFor } from "~/modules/run/run/application/pollScreen.viewmodel";
import { runReadoutFor } from "~/modules/run/run/application/runReadout.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { unlockLinesFor } from "~/modules/run/run/application/unlockNotes.viewmodel";
import { RunOverScreen } from "~/ui/kanto-theme/RunOverScreen.ui";

export type RunOverViewProps = {
	view: RunView;
	runNumber?: number | null;
	onNewRun: () => void;
	onCommunity?: () => void;
	archiveAfterKb?: number;
};

export const runOverFrameOf = (
	view: RunView,
	archiveAfterKb?: number,
	runNumber: number | null = null
): RunOverFrame => {
	const won = view.status === "won";
	const gate = won ? view.victoryGate : view.gateStake.gateNumber;

	return {
		gate,
		won,
		answers: view.allAnswered,
		payouts: runPaidFor(view),
		bar: closedBarFor(
			won ? "cleared" : "fatal",
			gate,
			view.gateStake.coverageLadder,
			view.gateStake.coverageHeld
		),
		unitsHeld: view.gateStake.unitsHeld,
		swatchGates: view.swatchGates,
		configs: view.configs,
		space: view.buildSpace.space,
		weight: view.buildSpace.weight,
		balanceKb: view.storage,
		upkeepPaidKb: view.upkeepPaidKb,
		...(archiveAfterKb === undefined ? {} : { archiveAfterKb }),
		unlocked: unlockLinesFor(view.unlockedThisRun),
		readout: runReadoutFor(view, runNumber),
	};
};

export const RunOverView = ({
	view,
	runNumber = null,
	onNewRun,
	onCommunity,
	archiveAfterKb,
}: RunOverViewProps) => {
	const props = runOverPropsFor(
		runOverFrameOf(view, archiveAfterKb, runNumber)
	);

	return (
		<RunOverScreen
			{...props}
			footer={{
				...props.footer,
				action: { ...props.footer.action, onPress: onNewRun },
				asides: (props.footer.asides ?? []).map((aside) => ({
					...aside,
					onPress: onCommunity,
				})),
			}}
		/>
	);
};

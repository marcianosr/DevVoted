import { closedBarFor } from "~/modules/run/gate/application/gateOutcome.viewmodel";
import {
	type RunOverFrame,
	runOverPropsFor,
} from "~/modules/run/run/application/runOverScreen.viewmodel";
import { runPaidFor } from "~/modules/run/run/application/pollScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { unlockLinesFor } from "~/modules/run/run/application/unlockNotes.viewmodel";
import { RunOverScreen } from "~/ui/kanto-theme/RunOverScreen.ui";

export type RunOverViewProps = {
	view: RunView;
	onNewRun: () => void;
	onCommunity?: () => void;
	/** The account archive after this run banks. Absent wherever no server answered. */
	archiveAfterKb?: number;
};

export const runOverFrameOf = (
	view: RunView,
	archiveAfterKb?: number
): RunOverFrame => {
	const won = view.status === "won";

	return {
		gate: won ? view.victoryGate : view.gateStake.gateNumber,
		won,
		answers: view.allAnswered,
		payouts: runPaidFor(view),
		bar: closedBarFor(
			won ? "cleared" : "fatal",
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
	};
};

/** Tier 2: the whole run reported once, for a climb that summited or stopped. */
export const RunOverView = ({
	view,
	onNewRun,
	onCommunity,
	archiveAfterKb,
}: RunOverViewProps) => {
	const props = runOverPropsFor(runOverFrameOf(view, archiveAfterKb));

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

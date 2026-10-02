import { useState } from "react";

import { reviewPropsFor } from "~/modules/run/gate/application/gateReview.viewmodel";
import { gateAnswersOf } from "~/modules/run/gate/application/gateOutcome.viewmodel";
import { runReadoutFor } from "~/modules/run/run/application/runReadout.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { ReviewScreen } from "~/ui/kanto-theme/ReviewScreen.ui";

export type ReviewViewProps = {
	view: RunView;
	runNumber?: number | null;
	back: { label: string; onUse: () => void };
};

const gateOf = (view: RunView): number =>
	view.status === "rewarding"
		? view.gatePayout.clearedGateNumber
		: view.gateStake.gateNumber;

export const ReviewView = ({
	view,
	runNumber = null,
	back,
}: ReviewViewProps) => {
	const [open, setOpen] = useState(false);

	const gate = gateOf(view);
	const props = reviewPropsFor({
		gate,
		answers: gateAnswersOf(view.answeredThisGate, gate),
		open: open ? true : undefined,
		swatchGates: view.swatchGates,
		balanceKb: view.storage,
		readout: runReadoutFor(view, runNumber),
	});

	return (
		<ReviewScreen
			{...props}
			expand={{ ...props.expand, onPress: () => setOpen(!open) }}
			footer={{
				...props.footer,
				action: { label: back.label, onPress: back.onUse },
			}}
		/>
	);
};

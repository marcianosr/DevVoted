import { useState } from "react";

import {
	type GateOutcomeScreenHandlers,
	gateOutcomeScreenPropsFor,
	outcomeRevealFor,
	outcomeRevealKeyOf,
} from "~/modules/run/gate/application/gateOutcome.viewmodel";
import { useRevealOnce } from "~/modules/run/gate/application/useRevealOnce.hook";
import type { GateCloseView } from "~/modules/run/run/application/gateClose.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { GateOutcomeScreen } from "~/ui/kanto-theme/GateOutcomeScreen.ui";
import { OutcomeReveal } from "~/ui/kanto-theme/OutcomeReveal.ui";

export type GateOutcomeViewProps = GateOutcomeScreenHandlers & {
	view: RunView;
	runNumber?: number | null;
};

type GateRevealProps = {
	view: RunView;
	close: GateCloseView;
	runNumber: number | null;
};

const GateReveal = ({ view, close, runNumber }: GateRevealProps) => {
	const { playing, done } = useRevealOnce(
		outcomeRevealKeyOf({ view, close, runNumber })
	);

	if (!playing) return null;

	return (
		<OutcomeReveal
			{...outcomeRevealFor({ view, close, runNumber })}
			onDone={done}
		/>
	);
};

export const GateOutcomeView = ({
	view,
	runNumber = null,
	...on
}: GateOutcomeViewProps) => {
	const [chosen, setChosen] = useState<readonly string[]>([]);
	const [fromStorage, setFromStorage] = useState(false);

	if (view.lastClose === null) return null;

	return (
		<>
			<GateOutcomeScreen
				{...gateOutcomeScreenPropsFor({
					view,
					close: view.lastClose,
					runNumber,
					on,
					picks: {
						chosen,
						onToggle: (configId) =>
							setChosen((held) =>
								held.includes(configId)
									? held.filter((id) => id !== configId)
									: [...held, configId]
							),
						fromStorage,
						onToggleStorage: () => setFromStorage((paying) => !paying),
						onPick: (configIds, paying) => {
							setChosen(configIds);
							setFromStorage(paying);
						},
					},
				})}
			/>
			<GateReveal view={view} close={view.lastClose} runNumber={runNumber} />
		</>
	);
};

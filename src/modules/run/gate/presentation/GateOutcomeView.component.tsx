import { useState } from "react";

import {
	type GateOutcomeScreenHandlers,
	gateOutcomeScreenPropsFor,
} from "~/modules/run/gate/application/gateOutcome.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { GateOutcomeScreen } from "~/ui/kanto-theme/GateOutcomeScreen.ui";

export type GateOutcomeViewProps = GateOutcomeScreenHandlers & {
	view: RunView;
	runNumber?: number | null;
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
				},
			})}
		/>
	);
};

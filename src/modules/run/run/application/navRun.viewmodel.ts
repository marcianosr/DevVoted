import { swatchTrackFor } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	BALANCE_WORD,
	fundsOf,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import type { NavRunReading } from "~/ui/kanto-theme/useNavRun.hook";

export const navRunFor = (
	view: RunView | null | undefined
): NavRunReading | undefined =>
	view === null || view === undefined
		? undefined
		: {
				swatches: swatchTrackFor(view.swatchGates, view.gateStake.gateNumber),
				funds: fundsOf(view.storage, BALANCE_WORD),
			};

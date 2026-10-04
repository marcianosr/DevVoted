import {
	type RunOverScreenHandlers,
	runOverScreenPropsFor,
} from "~/modules/run/run/application/runOverScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { RunOverScreen } from "~/ui/kanto-theme/RunOverScreen.ui";

export type RunOverViewProps = RunOverScreenHandlers & {
	view: RunView;
	runNumber?: number | null;
	archiveAfterKb?: number;
	startRefusal?: string;
};

export const RunOverView = ({
	view,
	runNumber = null,
	archiveAfterKb,
	startRefusal,
	...on
}: RunOverViewProps) => (
	<RunOverScreen
		{...runOverScreenPropsFor({
			view,
			runNumber,
			archiveAfterKb,
			startRefusal,
			on,
		})}
	/>
);

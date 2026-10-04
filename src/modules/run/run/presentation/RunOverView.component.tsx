import {
	type RunOverScreenHandlers,
	runOverScreenPropsFor,
} from "~/modules/run/run/application/runOverScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { RunOverScreen } from "~/ui/kanto-theme/RunOverScreen.ui";

export type RunOverViewProps = RunOverScreenHandlers & {
	view: RunView;
	archiveAfterKb?: number;
	startRefusal?: string;
};

export const RunOverView = ({
	view,
	archiveAfterKb,
	startRefusal,
	...on
}: RunOverViewProps) => (
	<RunOverScreen
		{...runOverScreenPropsFor({
			view,
			archiveAfterKb,
			startRefusal,
			on,
		})}
	/>
);

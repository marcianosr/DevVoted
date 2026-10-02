import {
	type PrepScreenHandlers,
	prepScreenPropsFor,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { ApprovalBoard } from "~/modules/run/run/domain/approval.model";
import { PrepScreen } from "~/ui/kanto-theme/PrepScreen.ui";

export type PrepViewProps = PrepScreenHandlers & {
	view: RunView;
	runNumber?: number | null;
	backLabel?: string;
	startRefusal?: string;
	approval?: ApprovalBoard | null;
};

export const PrepView = ({
	view,
	runNumber = null,
	backLabel,
	startRefusal,
	approval,
	...on
}: PrepViewProps) => (
	<PrepScreen
		{...prepScreenPropsFor({
			view,
			runNumber,
			backLabel,
			startRefusal,
			approval,
			on,
		})}
	/>
);

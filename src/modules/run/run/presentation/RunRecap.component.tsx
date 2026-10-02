import { Screen } from "~/ui/kanto-theme/Screen.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

import { RunOverView } from "~/modules/run/run/presentation/RunOverView.component";
import { nextFrom } from "~/modules/run/run/application/runRoutes.viewmodel";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { useRunRecap } from "~/modules/run/run/application/useRunRecap.hook";

export type RunRecapProps = {
	runId: number;
};

export const RunRecap = ({ runId }: RunRecapProps) => {
	const { view, isPending, errorMessage } = useRunRecap(runId);
	const goTo = useRunNavigation();

	if (isPending) {
		return (
			<Screen theme="pewter" width="narrow">
				<Typography variant="paragraph">Reading the archive…</Typography>
			</Screen>
		);
	}

	if (!view) {
		return (
			<Screen theme="pewter" width="narrow">
				<Typography variant="title">No such run</Typography>
				<Typography variant="paragraph">
					{errorMessage ?? "That climb is not in your archive."}
				</Typography>
			</Screen>
		);
	}

	return (
		<RunOverView
			view={view}
			archiveAfterKb={view.archiveAfterKb ?? undefined}
			onNewRun={() => goTo(nextFrom("over", view))}
		/>
	);
};

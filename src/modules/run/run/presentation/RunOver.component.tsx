import { RunOverView } from "~/modules/run/run/presentation/RunOverView.component";
import { COMMUNITY_ROUTE } from "~/modules/run/run/application/runRoutes.viewmodel";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunOver = () => {
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const { start } = useRunActions();
	const goTo = useRunNavigation();

	if (!view) return null;

	return (
		<RunOverView
			runNumber={runNumber.view}
			view={view}
			archiveAfterKb={view.archiveAfterKb ?? undefined}
			onNewRun={() => {
				if (start.isPending) return;
				start.mutate();
			}}
			onCommunity={() => goTo(COMMUNITY_ROUTE)}
		/>
	);
};

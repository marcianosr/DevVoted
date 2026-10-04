import { RunOverView } from "~/modules/run/run/presentation/RunOverView.component";
import {
	COMMUNITY_ROUTE,
	resumeTarget,
} from "~/modules/run/run/application/runRoutes.viewmodel";
import { startRefusalFor } from "~/modules/run/run/application/todayScreen.viewmodel";
import { usePollsLeftToday } from "~/modules/run/run/application/usePollsLeftToday.hook";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { useNextPollsCountdown } from "~/shared/hooks/useNextPollsCountdown.hook";

export const RunOver = () => {
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const { start } = useRunActions();
	const goTo = useRunNavigation();
	const countdown = useNextPollsCountdown();
	const pollsLeftToday = usePollsLeftToday();

	if (!view) return null;

	return (
		<RunOverView
			runNumber={runNumber.view}
			view={view}
			archiveAfterKb={view.archiveAfterKb ?? undefined}
			startRefusal={
				startRefusalFor(view, countdown, pollsLeftToday.view) ??
				start.errorMessage ??
				undefined
			}
			onNewRun={() => {
				if (start.isPending) return;
				start.mutate(undefined, {
					onSuccess: (result) => {
						if (result.success) goTo(resumeTarget(result.data));
					},
				});
			}}
			onCommunity={() => goTo(COMMUNITY_ROUTE)}
		/>
	);
};

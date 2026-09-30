import { useNavigate } from "@tanstack/react-router";

import { RunOverView } from "~/modules/run/run/presentation/RunOverView.component";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunOver = () => {
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const { start } = useRunActions();
	const navigate = useNavigate();

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
			onCommunity={() => navigate({ to: "/run/community" })}
		/>
	);
};

import { Screen } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

import { RunSummary } from "~/modules/run/run/presentation/RunSummary.ui";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

/** Tier 2: the end-of-run summary for a won or dead climb. */
export const RunOver = () => {
	const { view } = useTodaysRun();
	const { start } = useRunActions();

	if (!view) return null;

	return (
		<Screen
			width="narrow"
			rightAction={{
				label: "Start a new run →",
				onClick: () => start.mutate(),
				disabled: start.isPending,
			}}
		>
			<RunSummary
				won={view.status === "won"}
				gatesCleared={view.gatesCleared}
				victoryGate={view.victoryGate}
				coverage={view.coverage}
				storage={view.storage}
				configs={view.configs}
				answered={view.allAnswered}
			/>
			{start.data?.success === false && (
				<Paragraph>{start.data.error}</Paragraph>
			)}
		</Screen>
	);
};

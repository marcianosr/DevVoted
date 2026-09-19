import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/kanto-theme/Screen.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

import { RunOverView } from "~/modules/run/run/presentation/RunOverView.component";
import { useRunRecap } from "~/modules/run/run/application/useRunRecap.hook";

export type RunRecapProps = {
	runId: number;
};

/** Tier 2: one finished climb, read-only, at a URL worth keeping. */
export const RunRecap = ({ runId }: RunRecapProps) => {
	const { view, isPending, errorMessage } = useRunRecap(runId);
	const navigate = useNavigate();

	if (isPending) {
		return (
			<Screen theme="pewter" width="narrow">
				<Typography variant="paragraph">Reading the archive…</Typography>
			</Screen>
		);
	}

	// A run belonging to someone else reads the same as one that never existed:
	// the service refuses both without distinguishing them.
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
			onNewRun={() => navigate({ to: "/run" })}
		/>
	);
};

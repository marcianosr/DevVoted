import { useNavigate } from "@tanstack/react-router";

import { ReviewView } from "~/modules/run/run/presentation/ReviewView.component";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunReview = () => {
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const navigate = useNavigate();

	if (!view) return null;

	return (
		<ReviewView
			runNumber={runNumber.view}
			view={view}
			back={{
				label: "Back to the gate",
				onUse: () => navigate({ to: "/run/gate" }),
			}}
		/>
	);
};

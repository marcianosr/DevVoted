import { useNavigate } from "@tanstack/react-router";

import { ReviewView } from "~/modules/run/run/presentation/ReviewView.component";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunReview = () => {
	const { view } = useTodaysRun();
	const navigate = useNavigate();

	if (!view) return null;

	return (
		<ReviewView
			view={view}
			back={{
				label: "Back to the gate",
				onUse: () => navigate({ to: "/run/gate" }),
			}}
		/>
	);
};

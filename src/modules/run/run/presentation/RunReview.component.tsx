import { useNavigate } from "@tanstack/react-router";

import { ReviewView } from "~/modules/run/run/presentation/ReviewView.component";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

/**
 * The gate's answers, on a page of their own. They used to close the outcome
 * screen, which put the payout and five expandable questions on one scroll —
 * the outcome is the beat you just earned, the review is study material, and
 * they want different attention. Still inside the gate's own status, so it is
 * a page turn rather than a state change, and the way back is the one screen
 * both ends of a gate share.
 */
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

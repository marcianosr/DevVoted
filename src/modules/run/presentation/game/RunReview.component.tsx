import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

import { ReviewAnswers } from "../run/ReviewAnswers.ui";
import { useRunActions } from "./useRunActions.hook";
import { useTodaysRun } from "./useTodaysRun.hook";

/**
 * The gate's answers, on a page of their own. They used to close the reward
 * screen, which put the payout and five expandable questions on one scroll —
 * the reward is the beat you just earned, the review is study material, and
 * they want different attention. Still inside the gate's own status, so it is
 * a page turn rather than a state change.
 *
 * Both ends of a gate land here, and the way out differs because what follows
 * does: a cleared gate goes shopping, a failed one has already paid its price
 * on the strip screen and only needs the climb resumed. The status decides,
 * since it is the same thing the route sync is policing.
 */
export const RunReview = () => {
	const { view } = useTodaysRun();
	const { sendWith, commit, busy } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	const afterFailedGate = view.status === "awaiting-strip";

	// The failure path takes the same community detour as the shop: commit the
	// resume, then step outside the layout. The climb restarts from the community
	// page ("Climb on →").
	const resumeToCommunity = () =>
		sendWith({ type: "resume-climb" }, (result) => {
			if (!result.success) return;
			commit(result);
			navigate({ to: "/run/community" });
		});

	return (
		<Screen
			theme={afterFailedGate ? "cinnabar" : "celadon"}
			leftAction={{
				label: afterFailedGate ? "← Back to the gate" : "← Back to rewards",
				onClick: () =>
					navigate({ to: afterFailedGate ? "/run/strip" : "/run/reward" }),
			}}
			rightAction={
				afterFailedGate
					? {
							label: "Community →",
							onClick: resumeToCommunity,
							disabled: busy,
						}
					: {
							label: "Continue to shop →",
							onClick: () => navigate({ to: "/run/shop" }),
						}
			}
		>
			{view.answeredThisGate.length === 0 ? (
				<Paragraph tone="muted">No answers to review this gate.</Paragraph>
			) : (
				<ReviewAnswers answered={view.answeredThisGate} />
			)}
		</Screen>
	);
};

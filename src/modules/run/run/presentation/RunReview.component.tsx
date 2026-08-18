import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

import { ReviewAnswers } from "~/modules/run/run/presentation/ReviewAnswers.ui";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

/**
 * The gate's answers, on a page of their own. They used to close the reward
 * screen, which put the payout and five expandable questions on one scroll —
 * the reward is the beat you just earned, the review is study material, and
 * they want different attention. Still inside the gate's own status, so it is
 * a page turn rather than a state change.
 *
 * Both ends of a gate land here, and the way out differs because what follows
 * does: a cleared gate is already in the shopping half of the loop, a failed one
 * has to be let back into it — the strip screen took the peel, and resuming is
 * what opens the shop (ADR-037). The status decides, since it is the same thing
 * the route sync is policing.
 */
export const RunReview = () => {
	const { view } = useTodaysRun();
	const { sendWith, commit, busy } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	const afterFailedGate = view.status === "awaiting-strip";

	// Resuming is what turns the failed gate back into the normal loop, so the
	// click that commits it lands where that loop starts: the shop, with the KB
	// that has to buy a different attempt.
	const resumeToShop = () =>
		sendWith({ type: "resume-climb" }, (result) => {
			if (!result.success) return;
			commit(result);
			navigate({ to: "/run/shop" });
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
							label: "To the shop →",
							onClick: resumeToShop,
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

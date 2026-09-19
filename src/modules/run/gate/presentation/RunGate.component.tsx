import { useNavigate } from "@tanstack/react-router";

import { GateOutcomeView } from "~/modules/run/gate/presentation/GateOutcomeView.component";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

/**
 * Tier 2: both ends of a gate. The clear and the hold are one screen wearing
 * two verdicts (ADR-076), and the status already says which — so the route is
 * one route and the verdict is read, never passed.
 */
export const RunGate = () => {
	const { view } = useTodaysRun();
	const { send, sendWith, commit, busy } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	const held = view.status === "awaiting-strip";

	// Resuming is what turns the failed gate back into the normal loop (ADR-037),
	// so the click that commits it lands where that loop starts: the shop, with
	// the KB that has to buy a different attempt.
	const resumeToShop = () =>
		sendWith({ type: "resume-climb" }, (result) => {
			if (!result.success) return;
			commit(result);
			navigate({ to: "/run/shop" });
		});

	/**
	 * Two requests, not N: the whole tick-list settles in one `strip`. An empty
	 * list is the waived peel (ADR-057) — there is nothing to repair, so it skips
	 * straight to the resume rather than sending an action the schema refuses.
	 */
	const payPeel = (configIds: readonly string[]) => {
		if (busy) return;
		if (configIds.length === 0) return resumeToShop();

		sendWith({ type: "strip", configIds }, (result) => {
			if (!result.success) return;
			commit(result);
			if (result.data.peelSlotsRemaining === 0) resumeToShop();
		});
	};

	return (
		<GateOutcomeView
			view={view}
			verdict={held ? "held" : "cleared"}
			onReview={() => navigate({ to: "/run/review" })}
			onNext={() => navigate({ to: held ? "/run/review" : "/run/shop" })}
			onCommunity={held ? undefined : () => navigate({ to: "/run/community" })}
			onRemove={held ? payPeel : undefined}
			onRefuse={held ? () => send({ type: "refuse-gate" }) : undefined}
		/>
	);
};

import { useNavigate } from "@tanstack/react-router";

import { GateOutcomeView } from "~/modules/run/gate/presentation/GateOutcomeView.component";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunGate = () => {
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const { send, sendWith, commit, busy } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	const held = view.status === "awaiting-strip";

	const resumeToShop = () =>
		sendWith({ type: "resume-climb" }, (result) => {
			if (!result.success) return;
			commit(result);
			navigate({ to: "/run/shop" });
		});

	const payPeel = (configIds: readonly string[], fromStorage: boolean) => {
		if (busy) return;
		if (configIds.length === 0 && !fromStorage) return resumeToShop();

		sendWith({ type: "strip", configIds, fromStorage }, (result) => {
			if (!result.success) return;
			commit(result);
			if (result.data.peelSlotsRemaining === 0) resumeToShop();
		});
	};

	return (
		<GateOutcomeView
			runNumber={runNumber.view}
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

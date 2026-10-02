import { GateOutcomeView } from "~/modules/run/gate/presentation/GateOutcomeView.component";
import {
	COMMUNITY_ROUTE,
	nextFrom,
	RUN_ROUTES,
} from "~/modules/run/run/application/runRoutes.viewmodel";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunGate = () => {
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const { send, sendThen, busy } = useRunActions();
	const goTo = useRunNavigation();

	if (!view) return null;

	const held = view.status === "awaiting-strip";

	const resumeToShop = () =>
		sendThen({ type: "resume-climb" }, (next) => goTo(nextFrom("gate", next)));

	const payPeel = (configIds: readonly string[], fromStorage: boolean) => {
		if (busy) return;
		if (configIds.length === 0 && !fromStorage) return resumeToShop();

		sendThen({ type: "strip", configIds, fromStorage }, (next) => {
			if (next.peelSlotsRemaining === 0) resumeToShop();
		});
	};

	return (
		<GateOutcomeView
			runNumber={runNumber.view}
			view={view}
			onReview={() => goTo(RUN_ROUTES.review)}
			onNext={() => goTo(nextFrom("gate", view))}
			onCommunity={held ? undefined : () => goTo(COMMUNITY_ROUTE)}
			onRemove={held ? payPeel : undefined}
			onRefuse={held ? () => send({ type: "refuse-gate" }) : undefined}
		/>
	);
};

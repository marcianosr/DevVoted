import { crowdSubmitterFor } from "~/modules/run/build/domain/build.model";
import { useApprovalSlots } from "~/modules/run/community/presentation/useApprovalSlots.hook";
import { useNextPollsCountdown } from "~/shared/hooks/useNextPollsCountdown.hook";
import { NEW_POLLS_IN } from "~/shared/lib/copy";
import { PrepView } from "~/modules/run/run/presentation/PrepView.component";
import {
	COMMUNITY_ROUTE,
	nextFrom,
	prepBackOf,
	prepDepartureOf,
} from "~/modules/run/run/application/runRoutes.viewmodel";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";

export const RunPrep = () => {
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const { send, sendThen, busy } = useRunActions();
	const goTo = useRunNavigation();
	const countdown = useNextPollsCountdown();
	const approval = useApprovalSlots(
		crowdSubmitterFor(view?.configs ?? []) !== undefined
	);

	if (!view) return null;

	const startGate = () => {
		if (busy) return;
		const departure = prepDepartureOf(view);
		if (departure === null) return goTo(nextFrom("prep", view));

		sendThen(departure, (next) => goTo(nextFrom("prep", next)));
	};

	const back = prepBackOf(view);

	return (
		<PrepView
			runNumber={runNumber.view}
			view={view}
			onStart={startGate}
			onBackToShop={back === null ? undefined : () => goTo(back.path)}
			backLabel={back?.label}
			onCommunity={() => goTo(COMMUNITY_ROUTE)}
			startRefusal={
				view.pollsExhausted && !countdown.isOpen
					? NEW_POLLS_IN(countdown.remaining)
					: undefined
			}
			onEstimate={(count) => send({ type: "estimate", count })}
			onCommitBand={(band) => send({ type: "commit-band", band })}
			onRebase={(from, to) => send({ type: "rebase", from, to })}
			approval={approval}
			onApprove={(pollId) => send({ type: "approve-slot", pollId })}
		/>
	);
};

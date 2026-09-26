import { useNavigate } from "@tanstack/react-router";

import { useNextPollsCountdown } from "~/modules/run/community/presentation/useNextPollsCountdown.hook";
import { attackPanelFor } from "~/modules/run/incident/application/incident.viewmodel";
import { useAttackTargets } from "~/modules/run/incident/application/useAttackTargets.hook";
import { useFireAudit } from "~/modules/run/incident/application/useFireAudit.hook";
import { PrepView } from "~/modules/run/run/presentation/PrepView.component";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

const SHOP_PHASE = "rewarding";
const OPENING_PHASE = "configuring";
const ANSWERING = "answering";

export const RunPrep = () => {
	const { view } = useTodaysRun();
	const { send, sendWith, commit, busy } = useRunActions();
	const navigate = useNavigate();
	const countdown = useNextPollsCountdown();
	const targets = useAttackTargets((view?.heldAudit ?? null) !== null);
	const fire = useFireAudit();

	if (!view) return null;

	const fireRefusal =
		fire.data?.success === false ? fire.data.error : undefined;

	const parkedInShopPhase = view.status === SHOP_PHASE;
	const beforeFirstGate = view.status === OPENING_PHASE;

	const startGate = () => {
		if (busy) return;
		if (!parkedInShopPhase && !beforeFirstGate)
			return navigate({ to: "/run/poll" });

		sendWith(
			{ type: beforeFirstGate ? "start" : "finish-reward" },
			(result) => {
				if (!result.success) return;
				commit(result);
				if (result.data.status === ANSWERING) navigate({ to: "/run/poll" });
			}
		);
	};

	const back = beforeFirstGate
		? () => navigate({ to: "/run/new" })
		: parkedInShopPhase
			? () => navigate({ to: "/run/shop" })
			: undefined;

	return (
		<PrepView
			view={view}
			onStart={startGate}
			onBackToShop={back}
			backLabel={beforeFirstGate ? "← Back to the build" : undefined}
			onCommunity={() => navigate({ to: "/run/community" })}
			startRefusal={
				view.pollsExhausted && !countdown.isOpen ? countdown.label : undefined
			}
			onEstimate={(count) => send({ type: "estimate", count })}
			onCommitBand={(band) => send({ type: "commit-band", band })}
			onRebase={(from, to) => send({ type: "rebase", from, to })}
			attack={attackPanelFor(
				view.gateStake.gateNumber,
				view.heldAudit,
				targets.view?.offers ?? null,
				targets.errorMessage,
				fireRefusal
			)}
			onFire={(targetRunId, auditId) => {
				if (!fire.isPending) fire.mutate({ targetRunId, auditId });
			}}
		/>
	);
};

import { useNavigate } from "@tanstack/react-router";

import { useNextPollsCountdown } from "~/modules/run/community/presentation/useNextPollsCountdown.hook";
import { PrepView } from "~/modules/run/run/presentation/PrepView.component";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

const SHOP_PHASE = "rewarding";
const OPENING_PHASE = "configuring";
const ANSWERING = "answering";

/**
 * Tier 2: the stake of the gate in front. Reached from two places, so the
 * screen names its exit for wherever the player came from (ADR-078): the build
 * before gate 0, the shop after every later one.
 */
export const RunPrep = () => {
	const { view } = useTodaysRun();
	const { send, sendWith, commit, busy } = useRunActions();
	const navigate = useNavigate();
	const countdown = useNextPollsCountdown();

	if (!view) return null;

	const parkedInShopPhase = view.status === SHOP_PHASE;
	const beforeFirstGate = view.status === OPENING_PHASE;

	// `start` and `finish-reward` are the same beat at two ages: the run has not
	// begun, or the shop half of the loop is closing. Both end on the poll.
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
			onRebase={(from, to) => send({ type: "rebase", from, to })}
		/>
	);
};

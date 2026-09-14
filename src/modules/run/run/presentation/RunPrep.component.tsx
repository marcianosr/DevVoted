import { useNavigate } from "@tanstack/react-router";

import { useNextPollsCountdown } from "~/modules/run/community/presentation/useNextPollsCountdown.hook";
import { PrepView } from "~/modules/run/run/presentation/PrepView.component";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

const SHOP_PHASE = "rewarding";
const ANSWERING = "answering";

export const RunPrep = () => {
	const { view } = useTodaysRun();
	const { sendWith, commit, busy } = useRunActions();
	const navigate = useNavigate();
	const countdown = useNextPollsCountdown();

	if (!view) return null;

	const parkedInShopPhase = view.status === SHOP_PHASE;

	const startGate = () => {
		if (busy) return;
		if (!parkedInShopPhase) return navigate({ to: "/run/answer" });

		sendWith({ type: "finish-reward" }, (result) => {
			if (!result.success) return;
			commit(result);
			if (result.data.status === ANSWERING) navigate({ to: "/run/answer" });
		});
	};

	return (
		<PrepView
			view={view}
			onStart={startGate}
			onBackToShop={
				parkedInShopPhase ? () => navigate({ to: "/run/shop" }) : undefined
			}
			onCommunity={() => navigate({ to: "/run/community" })}
			startRefusal={
				view.pollsExhausted && !countdown.isOpen ? countdown.label : undefined
			}
		/>
	);
};

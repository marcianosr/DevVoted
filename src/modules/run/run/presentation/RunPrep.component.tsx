import { useNavigate } from "@tanstack/react-router";

import { perAnswerPreviewFor } from "~/modules/run/pipeline/domain/pipeline.model";
import { Screen } from "~/ui/Screen.ui";

import { useNextPollsCountdown } from "~/modules/run/community/presentation/useNextPollsCountdown.hook";
import { PrepScreen } from "~/modules/run/run/presentation/PrepScreen.ui";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunPrep = () => {
	const { view } = useTodaysRun();
	const { send, sendWith, commit, busy } = useRunActions();
	const navigate = useNavigate();
	const countdown = useNextPollsCountdown();

	if (!view) return null;

	const parkedInShopPhase = view.status === "rewarding";
	const backToShop = parkedInShopPhase
		? {
				label: "← Back to shop",
				onClick: () => navigate({ to: "/run/shop" }),
			}
		: undefined;
	const gateLocked = view.pollsExhausted && !countdown.isOpen;

	const dropConfig = (configId: string) => {
		if (busy) return;
		send({ type: "drop", configId });
	};

	const startGate = () => {
		if (busy) return;
		if (!parkedInShopPhase) return navigate({ to: "/run/answer" });
		sendWith({ type: "finish-reward" }, (result) => {
			if (!result.success) return;
			commit(result);
			if (result.data.status === "answering") navigate({ to: "/run/answer" });
		});
	};

	return (
		<Screen
			gateTheme={view.gateTheme}
			leftAction={backToShop}
			rightAction={{
				label: "Community →",
				onClick: () => navigate({ to: "/run/community" }),
			}}
		>
			<PrepScreen
				gateNumber={view.gatesCleared}
				pollsPerGate={view.pollsPerGate}
				stripsOnFailure={view.stripsOnFailure}
				minConfigs={view.minConfigs}
				storageBillKb={view.storageBillKb}
				modifiers={{
					gateReward: view.gateReward,
					rewardMultiplier: view.rewardMultiplier,
					coverageMultiplier: view.coverageMultiplier,
					coverageAdd: view.coverageAdd,
				}}
				perAnswer={perAnswerPreviewFor(view.configs, view.gatesCleared)}
				configs={view.configs}
				startLock={gateLocked ? countdown.label : undefined}
				shopAction={backToShop}
				onStartGate={startGate}
				onDropConfig={dropConfig}
			/>
		</Screen>
	);
};

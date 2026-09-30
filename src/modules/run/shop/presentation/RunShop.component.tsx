import { useNavigate } from "@tanstack/react-router";

import { useAttackTargets } from "~/modules/run/incident/application/useAttackTargets.hook";
import { ShopView } from "~/modules/run/shop/presentation/ShopView.component";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";

export const RunShop = () => {
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const { send, sendWith, commit, abandon } = useRunActions();
	const navigate = useNavigate();
	const targets = useAttackTargets(view?.incidentOffer != null);

	if (!view) return null;

	const skipShop = () =>
		sendWith({ type: "skip-shop" }, (result) => {
			if (!result.success) return;
			commit(result);
			navigate({ to: "/run/prep" });
		});

	return (
		<ShopView
			runNumber={runNumber.view}
			view={view}
			onDraft={(configId) => send({ type: "draft", configId })}
			onSell={(configId) => send({ type: "sell", configId })}
			onUpgrade={(configId) => send({ type: "upgrade", configId })}
			onRebuild={() => send({ type: "rebuild-draft" })}
			onSkip={skipShop}
			onExtend={() => send({ type: "extend-offers" })}
			onPlantPin={() => send({ type: "plant-pin" })}
			onAbandon={() => abandon.mutate()}
			onVendorLock={(configId) => send({ type: "vendor-lock", configId })}
			onBuyIncident={() => send({ type: "buy-incident" })}
			onRefreshIncident={() => send({ type: "refresh-incident" })}
			rivalsInReach={targets.view?.rivalsForOffer ?? null}
			onContinue={() => navigate({ to: "/run/prep" })}
			onCommunity={() => navigate({ to: "/run/community" })}
		/>
	);
};

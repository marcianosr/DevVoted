import { useAttackTargets } from "~/modules/run/incident/application/useAttackTargets.hook";
import { ShopView } from "~/modules/run/shop/presentation/ShopView.component";
import {
	COMMUNITY_ROUTE,
	nextFrom,
} from "~/modules/run/run/application/runRoutes.viewmodel";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useRunNavigation } from "~/modules/run/run/application/useRunNavigation.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { useRunNumber } from "~/modules/run/run/application/useRunNumber.hook";

export const RunShop = () => {
	const { view } = useTodaysRun();
	const runNumber = useRunNumber();
	const { send, sendThen, abandon } = useRunActions();
	const goTo = useRunNavigation();
	const targets = useAttackTargets(view?.incidentOffer != null);

	if (!view) return null;

	const skipShop = () =>
		sendThen({ type: "skip-shop" }, (next) => goTo(nextFrom("shop", next)));

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
			onContinue={() => goTo(nextFrom("shop", view))}
			onCommunity={() => goTo(COMMUNITY_ROUTE)}
		/>
	);
};

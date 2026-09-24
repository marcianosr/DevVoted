import { useNavigate } from "@tanstack/react-router";

import { ShopView } from "~/modules/run/shop/presentation/ShopView.component";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

/** Tier 2: the registry, and the KB that installs from it. */
export const RunShop = () => {
	const { view } = useTodaysRun();
	const { send } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	return (
		<ShopView
			view={view}
			onDraft={(configId) => send({ type: "draft", configId })}
			onSell={(configId) => send({ type: "sell", configId })}
			onUpgrade={(configId) => send({ type: "upgrade", configId })}
			onRebuild={() => send({ type: "rebuild-draft" })}
			onExtend={() => send({ type: "extend-offers" })}
			onPlantPin={() => send({ type: "plant-pin" })}
			onVendorLock={(configId) => send({ type: "vendor-lock", configId })}
			onContinue={() => navigate({ to: "/run/prep" })}
		/>
	);
};

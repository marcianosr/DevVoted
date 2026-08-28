import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";

import {
	ShopScreen,
	shopExitAction,
} from "~/modules/run/shop/presentation/ShopScreen.ui";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";
import { useUpcomingCategories } from "~/modules/run/run/application/useUpcomingCategories.hook";

export const RunShop = () => {
	const { view } = useTodaysRun();
	const { send, busy } = useRunActions();
	const navigate = useNavigate();
	const upcoming = useUpcomingCategories(view);

	if (!view) return null;

	const action = shopExitAction(view.gatesCleared, view.overflowSpots);

	return (
		<Screen
			gateTheme={view.gateTheme}
			leftAction={{
				label: "← Back",
				onClick: () => navigate({ to: "/run/reward" }),
			}}
			rightAction={{
				...action,
				disabled: busy || action.disabled,
				onClick: () => navigate({ to: "/run/prep" }),
			}}
		>
			<ShopScreen
				storage={view.storage}
				coverageByCategory={view.coverageByCategory}
				stake={view.gateStake}
				configs={view.configs}
				atMinimumWidth={view.atMinimumWidth}
				controls={view.shopControls}
				busy={busy}
				newConfigIds={view.newConfigIds}
				offers={view.offers}
				upcoming={upcoming}
				onDraft={(id) => send({ type: "draft", configId: id })}
				onRebuild={() => send({ type: "rebuild-draft" })}
				onLock={(id) => send({ type: "lock-offer", configId: id })}
				onExtend={() => send({ type: "extend-offers" })}
				onPlantPin={() => send({ type: "plant-pin" })}
				spots={view.spots}
				spotsUsed={view.spotsUsed}
				spotsFree={view.spotsFree}
				upgradedConfigId={view.gatePayout.autoUpgradedConfig?.id}
				onUpgrade={(id) => send({ type: "upgrade", configId: id })}
				onSell={(id) => send({ type: "sell", configId: id })}
				extraSpots={view.extraSpots}
				onRentExtraSpots={(spots) => send({ type: "set-extra-spots", spots })}
			/>
		</Screen>
	);
};

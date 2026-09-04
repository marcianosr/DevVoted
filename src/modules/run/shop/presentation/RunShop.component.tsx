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

	const action = shopExitAction(view.gatesCleared, view.overflowSlots);

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
				onUnlock={(id) => send({ type: "unlock-offer", configId: id })}
				onExtend={() => send({ type: "extend-offers" })}
				onPlantPin={() => send({ type: "plant-pin" })}
				slots={view.slots}
				slotsUsed={view.slotsUsed}
				slotsFree={view.slotsFree}
				upgradedConfigId={view.gatePayout.autoUpgradedConfig?.id}
				onUpgrade={(id) => send({ type: "upgrade", configId: id })}
				onSell={(id) => send({ type: "sell", configId: id })}
				slotDeals={view.slotDeals}
				storagePlan={view.storagePlan}
				onBuySlot={() => send({ type: "buy-slot" })}
				onCashSlot={() => send({ type: "cash-slot" })}
				onSetStoragePlan={(tier) => send({ type: "set-storage-plan", tier })}
			/>
		</Screen>
	);
};

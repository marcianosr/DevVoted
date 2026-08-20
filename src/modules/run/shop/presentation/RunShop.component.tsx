import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";

import {
	ShopScreen,
	shopExitAction,
} from "~/modules/run/shop/presentation/ShopScreen.ui";
import { useRunActions } from "~/modules/run/run/application/useRunActions.hook";
import { useTodaysRun } from "~/modules/run/run/application/useTodaysRun.hook";

export const RunShop = () => {
	const { view } = useTodaysRun();
	const { send, busy } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	const action = shopExitAction(view.gatesCleared);

	return (
		<Screen
			gateTheme={view.gateTheme}
			leftAction={{
				label: "← Back",
				onClick: () => navigate({ to: "/run/reward" }),
			}}
			rightAction={{
				...action,
				disabled: busy,
				onClick: () => navigate({ to: "/run/prep" }),
			}}
		>
			<ShopScreen
				storage={view.storage}
				coverageByCategory={view.coverageByCategory}
				stake={view.gateStake}
				configs={view.configs}
				atMinimumWidth={view.atMinimumWidth}
				locked={view.shopLocked}
				newConfigIds={view.newConfigIds}
				offers={view.offers}
				onDraft={(id) => send({ type: "draft", configId: id })}
				rebuildCost={view.rebuildCost}
				canRebuild={view.canRebuild && !busy}
				onRebuild={() => send({ type: "rebuild-draft" })}
				lockAvailable={view.lockAvailable}
				lockCost={view.lockCost}
				canLock={view.canLock && !busy}
				onLock={(id) => send({ type: "lock-offer", configId: id })}
				extendAvailable={view.extendAvailable}
				extendCost={view.extendCost}
				canExtend={view.canExtend && !busy}
				onExtend={() => send({ type: "extend-offers" })}
				pinAvailable={view.pinAvailable}
				pinCost={view.pinCost}
				canPin={view.canPin && !busy}
				pinnedAtGate={view.pinnedAtGate}
				onPlantPin={() => send({ type: "plant-pin" })}
				slots={view.slots}
				nextSlotGate={view.nextSlotGate}
				justUnlockedSlots={view.justUnlockedSlots}
				upgradedConfigId={view.autoUpgradedConfig?.id}
				onUpgrade={(id) => send({ type: "upgrade", configId: id })}
				onSell={(id) => send({ type: "sell", configId: id })}
				storagePlans={view.storagePlans}
				onChangePlan={(tier) => send({ type: "change-plan", tier })}
			/>
		</Screen>
	);
};

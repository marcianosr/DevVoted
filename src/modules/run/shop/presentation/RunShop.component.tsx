import { useNavigate } from "@tanstack/react-router";

import { shopExitFor } from "~/modules/run/run/application/runView.viewmodel";
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

	const exit = shopExitFor(view);
	const action = shopExitAction(exit);

	return (
		<Screen
			width="wide"
			gateTheme={view.gateTheme}
			leftAction={{
				label: "← Back",
				onClick: () => navigate({ to: "/run/reward" }),
			}}
			rightAction={{
				...action,
				disabled: action.disabled || busy,
				onClick:
					exit.state === "stuck"
						? () => send({ type: "finish-reward" })
						: () => navigate({ to: "/run/prep" }),
			}}
		>
			<ShopScreen
				storage={view.storage}
				coverageByCategory={view.coverageByCategory}
				checks={view.checks}
				stake={view.gateStake}
				configs={view.configs}
				atMinimumWidth={view.atMinimumWidth}
				newConfigIds={view.newConfigIds}
				draftOptions={view.draftOptions}
				onDraft={(id) => send({ type: "draft", configId: id })}
				rebuildCost={view.rebuildCost}
				canRebuild={view.canRebuild && !busy}
				onRebuild={() => send({ type: "rebuild-draft" })}
				lockAvailable={view.lockAvailable}
				lockCost={view.lockCost}
				canLock={view.canLock && !busy}
				lockedOfferIds={view.lockedOfferIds}
				onLock={(id) => send({ type: "lock-offer", configId: id })}
				extendAvailable={view.extendAvailable}
				extendCost={view.extendCost}
				canExtend={view.canExtend && !busy}
				onExtend={() => send({ type: "extend-offers" })}
				slots={view.slots}
				coverage={view.coverage}
				slotCoverageRequired={view.slotCoverageRequired}
				justUnlockedSlots={view.justUnlockedSlots}
				onUpgrade={(id) => send({ type: "upgrade", configId: id })}
				onSell={(id) => send({ type: "sell", configId: id })}
				storagePlans={view.storagePlans}
				onChangePlan={(tier) => send({ type: "change-plan", tier })}
			/>
		</Screen>
	);
};

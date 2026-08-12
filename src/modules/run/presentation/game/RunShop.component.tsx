import { useNavigate } from "@tanstack/react-router";

import { perAnswerPreviewFor } from "~/modules/run/pipeline/pipeline.model";
import { shopExitFor } from "~/modules/run/view/runView.viewmodel";
import { Screen } from "~/ui/Screen.ui";

import { ShopScreen } from "../screens/ShopScreen.ui";
import { useRunActions } from "./useRunActions.hook";
import { useTodaysRun } from "./useTodaysRun.hook";

export const RunShop = () => {
	const { view } = useTodaysRun();
	const { send, busy } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	const exit = shopExitFor(view);

	return (
		<Screen
			width="wide"
			gateTheme={view.gateTheme}
			leftAction={{
				label: "← Back",
				onClick: () => navigate({ to: "/run/reward" }),
			}}
			rightAction={{
				label: exit.label,
				hint: exit.hint,
				variant: exit.variant,
				disabled: exit.disabled || busy,
				onClick: exit.endsRun
					? () => send({ type: "finish-reward" })
					: () => navigate({ to: "/run/prep" }),
			}}
		>
			<ShopScreen
				storage={view.storage}
				coverageByCategory={view.coverageByCategory}
				checks={view.checks}
				gateNumber={view.gatesCleared}
				configs={view.configs}
				pollsPerGate={view.pollsPerGate}
				stripsOnFailure={view.stripsOnFailure}
				minConfigs={view.minConfigs}
				modifiers={{
					gateReward: view.gateReward,
					rewardMultiplier: view.rewardMultiplier,
					coverageMultiplier: view.coverageMultiplier,
					coverageAdd: view.coverageAdd,
				}}
				perAnswer={perAnswerPreviewFor(view.configs, view.gatesCleared)}
				billKb={view.storageBillKb}
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

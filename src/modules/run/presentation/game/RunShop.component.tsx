import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";

import { ShopScreen } from "../screens/ShopScreen.ui";
import { useRunActions } from "./useRunActions.hook";
import { useTodaysRun } from "./useTodaysRun.hook";

/** Tier 2: the post-gate shop — second page of the reward flow. */
export const RunShop = () => {
	const { view } = useTodaysRun();
	const { send, sendWith, commit, busy } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	// Shop → "How you compared": commit the reward step, then detour to the
	// community page. The climb itself resumes from there ("Climb on →") — the
	// community route sits outside this layout, so the status sync won't fight
	// the detour.
	const finishToCommunity = () =>
		sendWith({ type: "finish-reward" }, (result) => {
			if (!result.success) return;
			commit(result);
			navigate({ to: "/run/community" });
		});

	return (
		<Screen
			width="wide"
			leftAction={{
				label: "← Back",
				onClick: () => navigate({ to: "/run/reward" }),
			}}
			rightAction={{
				label: "How you compared →",
				onClick: finishToCommunity,
				disabled: busy,
			}}
		>
			<ShopScreen
				storage={view.storage}
				coverageByCategory={view.coverageByCategory}
				checks={view.checks}
				gateNumber={view.gatesCleared + 1}
				configs={view.configs}
				gateReward={view.gateReward}
				rewardMultiplier={view.rewardMultiplier}
				coverageMultiplier={view.coverageMultiplier}
				coverageAdd={view.coverageAdd}
				newConfigIds={view.newConfigIds}
				draftOptions={view.draftOptions}
				onDraft={(id) => send({ type: "draft", configId: id })}
				rebuildCost={view.rebuildCost}
				canRebuild={view.canRebuild && !busy}
				onRebuild={() => send({ type: "rebuild-draft" })}
				slots={view.slots}
				coverage={view.coverage}
				slotCoverageRequired={view.slotCoverageRequired}
				canAddSlot={view.canAddSlot && !busy}
				onAddSlot={() => send({ type: "add-slot" })}
				onUpgrade={(id) => send({ type: "upgrade", configId: id })}
				onSell={(id) => send({ type: "sell", configId: id })}
			/>
		</Screen>
	);
};

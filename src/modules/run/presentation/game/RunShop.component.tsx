import { useNavigate } from "@tanstack/react-router";

import { Screen } from "~/ui/Screen.ui";

import { ShopScreen } from "../screens/ShopScreen.ui";
import { StorageShop } from "../screens/StorageShop.ui";
import { useRunActions } from "./useRunActions.hook";
import { useTodaysRun } from "./useTodaysRun.hook";

/** Tier 2: the post-gate shop — second page of the reward flow. */
export const RunShop = () => {
	const { view } = useTodaysRun();
	const { send, sendWith, commit, busy } = useRunActions();
	const navigate = useNavigate();

	if (!view) return null;

	// Shop → Community: commit the reward step, then detour to the
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
			gateTheme={view.gateTheme}
			leftAction={{
				label: "← Back",
				onClick: () => navigate({ to: "/run/reward" }),
			}}
			rightAction={{
				label: "Community →",
				onClick: finishToCommunity,
				disabled: busy,
			}}
		>
			<div className="space-y-8">
				{/* Pipeline Shop - two-column with current build */}
				<ShopScreen
					storage={view.storage}
					storageCap={view.storageCap}
					ownedStorageConfigs={view.ownedStorageConfigs}
					availableStorageConfigs={view.availableStorageConfigs}
					draftCostReduction={view.draftCostReduction}
					refundBoost={view.refundBoost}
					payoutBoost={view.payoutBoost}
					freeRebuild={view.freeRebuild}
					coverageByCategory={view.coverageByCategory}
					checks={view.checks}
					gateNumber={view.gatesCleared}
					configs={view.configs}
					gateReward={view.gateRewardPaidKb}
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

				{/* Storage Shop Section */}
				{view.slots < 3 ? (
					<div className="rounded-lg border border-zinc-700 bg-zinc-900/30 px-6 py-8 text-center">
						<p className="text-sm text-zinc-400">
							Unlock storage upgrades by reaching 3 total slots (2 new slots)
						</p>
					</div>
				) : (
					<StorageShop
						storage={view.storage}
						storageCap={view.storageCap}
						availableStorageConfigs={view.availableStorageConfigs}
						draftCostReduction={view.draftCostReduction}
						refundBoost={view.refundBoost}
						payoutBoost={view.payoutBoost}
						freeRebuild={view.freeRebuild}
						onUpgradeStorage={(configId) =>
							send({ type: "upgrade-storage", configId })
						}
						onDeinstallStorage={(configId) =>
							send({ type: "deinstall-storage", configId })
						}
					/>
				)}
			</div>
		</Screen>
	);
};

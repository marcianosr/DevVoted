import { useState } from "react";
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
	const [activeShop, setActiveShop] = useState<"pipeline" | "storage">(
		"pipeline"
	);

	if (!view) return null;

	const storageShopUnlocked = view.gatesCleared >= 3;

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
			{/* Shop tabs */}
			<div className="flex gap-2 border-b border-zinc-800 pb-4">
				<button
					type="button"
					className={`px-4 py-2 text-sm font-semibold transition ${
						activeShop === "pipeline"
							? "text-zinc-100 border-b-2 border-zinc-100"
							: "text-zinc-500 hover:text-zinc-400"
					}`}
					onClick={() => setActiveShop("pipeline")}
				>
					Pipeline
				</button>
				<button
					type="button"
					disabled={!storageShopUnlocked}
					className={`px-4 py-2 text-sm font-semibold transition ${
						activeShop === "storage"
							? "text-zinc-100 border-b-2 border-zinc-100"
							: storageShopUnlocked
								? "text-zinc-500 hover:text-zinc-400 cursor-pointer"
								: "text-zinc-700 cursor-not-allowed"
					}`}
					onClick={() => storageShopUnlocked && setActiveShop("storage")}
				>
					Storage{" "}
					{!storageShopUnlocked && (
						<span className="ml-2 text-xs text-zinc-600">(gate 3+)</span>
					)}
				</button>
			</div>

			{/* Shop content */}
			{activeShop === "pipeline" ? (
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
		</Screen>
	);
};

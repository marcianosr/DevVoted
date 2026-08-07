import { Screen } from "~/ui/Screen.ui";
import { StorageShop } from "../screens/StorageShop.ui";
import { useRunActions } from "./useRunActions.hook";
import { useTodaysRun } from "./useTodaysRun.hook";

export const RunStorageShop = () => {
	const { view } = useTodaysRun();
	const { send } = useRunActions();

	if (!view) return null;

	return (
		<Screen width="wide" gateTheme={view.gateTheme}>
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
		</Screen>
	);
};

import { Config } from "~/domains/configs/models/config";
import {
	canAddConfigToRun,
	hasConfig,
} from "~/domains/economy/services/configManager.service";
import { Run } from "~/domains/runs/models/run";

import { useShopContext } from "../../economy/contexts/ShopContext";

type UseConfigCardActionsOptions = {
	run: Run;
	config: Config;
	mode: "storage" | "shop";
};

export const useConfigCardActions = ({
	run,
	config,
	mode,
}: UseConfigCardActionsOptions) => {
	const { isShopOpen, addConfigToRun, removeConfigFromRun } = useShopContext();

	const configInRun = hasConfig(run, config.id);
	const canAdd = canAddConfigToRun(run, config);

	if (mode === "storage") {
		// StorageDeck: Allow selling configs when shop is open
		const onRemoveConfig =
			isShopOpen && configInRun
				? () => removeConfigFromRun(config.id)
				: undefined;

		return {
			onRemoveConfig,
			onAddConfig: undefined,
			onToggle: undefined,
			isSelected: false,
		};
	}

	if (mode === "shop") {
		// Shop: Allow buying configs when shop is open and storage is available
		const onAddConfig =
			isShopOpen && !configInRun && canAdd
				? () => addConfigToRun(config.id)
				: undefined;

		return {
			onRemoveConfig: undefined,
			onAddConfig,
			onToggle: undefined,
			disabled: !canAdd,
			isSelected: false,
		};
	}

	return {
		onRemoveConfig: undefined,
		onAddConfig: undefined,
		onToggle: undefined,
		disabled: true,
		isSelected: false,
	};
};

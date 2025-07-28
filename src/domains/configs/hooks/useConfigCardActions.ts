import { Config } from "~/domains/configs/models/config";
import { Run } from "~/domains/runs/models/run";
import {
	canAddConfigToRun,
	hasConfig,
} from "~/domains/configs/services/configStorage.service";
import { useShopContext } from "../contexts/ShopContext";

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
	const { isShopOpen, addConfigToRun, removeConfigFromRun } =
		useShopContext();

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
			disabled: !canAdd,
			isSelected: false,
		};
	}

	if (mode === "shop") {
		// Shop: Allow buying configs when shop is open

		const onAddConfig =
			isShopOpen && !configInRun
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

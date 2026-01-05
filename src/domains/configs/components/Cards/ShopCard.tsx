import { clsx } from "clsx";

import ConfigCard, { RARITY_COLORS } from "~/domains/configs/components/Cards";
import { Config } from "~/domains/configs/models/config";

type ShopConfigProps = {
	config: Config;
	disabled?: boolean;
	onInstall: (config: Config) => void;
};

const ShopCard = ({ config, disabled, onInstall }: ShopConfigProps) => {
	const disabledStyles = clsx(disabled && "opacity-50 cursor-not-allowed");
	return (
		<div className="flex flex-col gap-2 hover:scale-105 transition-transform cursor-pointer">
			<ConfigCard config={config} disabled={disabled} size="large" />
			<button
				onClick={() => !disabled && onInstall(config)}
				className={clsx(
					`border ${RARITY_COLORS[config.rarity].border} ${RARITY_COLORS[config.rarity].text} p-2 cursor-pointer`,
					disabledStyles
				)}
			>
				Install
			</button>
		</div>
	);
};

export default ShopCard;

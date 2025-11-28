import { clsx } from "clsx";

import ConfigCard, { RARITY_COLORS } from "~/domains/configs/components/Cards";
import { Config } from "~/domains/configs/models/config";

type ActiveCardProps = {
	config: Config;
	disabled?: boolean;
	onDeinstall: (config: Config) => void;
};

const ActiveCard = ({ config, disabled, onDeinstall }: ActiveCardProps) => {
	const disabledStyles = clsx(disabled && "opacity-50 cursor-not-allowed");
	return (
		<div className="flex flex-col gap-2 hover:scale-105 transition-transform cursor-pointer">
			<ConfigCard config={config} disabled={disabled} />
			<button
				onClick={() => !disabled && onDeinstall(config)}
				disabled={disabled}
				className={clsx(
					`border ${RARITY_COLORS[config.rarity].border} ${RARITY_COLORS[config.rarity].text} p-2 cursor-pointer`,
					disabledStyles
				)}
			>
				Deinstall
			</button>
		</div>
	);
};
export default ActiveCard;

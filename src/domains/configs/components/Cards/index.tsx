import { clsx } from "clsx";

import { Config } from "~/domains/configs/models/config";
import { formatStorage } from "~/lib/storage";

export const RARITY_COLORS = {
	common: { border: "border-cerulean", text: "text-cerulean" },
	uncommon: { border: "border-celadon", text: "text-celadon" },
	rare: { border: "border-cinnabar", text: "text-cinnabar" },
	legendary: { border: "border-indigo", text: "text-indigo" },
} as const;

type ConfigProps = {
	config: Config;
	disabled?: boolean;
};

const ConfigCard = ({ config, disabled }: ConfigProps) => {
	const rarityColor = RARITY_COLORS[config.rarity];

	return (
		<article
			className={clsx(
				"border p-4 w-52 min-h-52",
				rarityColor.border,
				disabled && "opacity-50 cursor-not-allowed"
			)}
		>
			<h3 className={clsx("text-2xl", rarityColor.text)}>{config.name}</h3>
			<p>Cost: {formatStorage(config.cost)}</p>
			<p>
				Rarity: <span className={rarityColor.text}>{config.rarity}</span>
			</p>
			<p className="border-t border-t-white mt-2 pt-2">{config.description}</p>
		</article>
	);
};

export default ConfigCard;

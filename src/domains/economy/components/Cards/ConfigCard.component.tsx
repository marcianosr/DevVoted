import { clsx } from "clsx";

import { Config } from "~/domains/economy/models/config.model";
import { calculateRefund } from "~/domains/economy/services/configManager.service";
import { formatStorage } from "~/lib/storage";

export const RARITY_COLORS = {
	common: {
		border: "border-cerulean",
		text: "text-cerulean",
		bg: "bg-cerulean/15",
	},
	uncommon: {
		border: "border-celadon",
		text: "text-celadon",
		bg: "bg-celadon/15",
	},
	rare: {
		border: "border-cinnabar",
		text: "text-cinnabar",
		bg: "bg-cinnabar/15",
	},
	legendary: {
		border: "border-indigo",
		text: "text-indigo",
		bg: "bg-indigo/15",
	},
} as const;

type ConfigProps = {
	config: Config;
	disabled?: boolean;
	size?: "small" | "large";
};

const ConfigCard = ({ config, disabled, size = "large" }: ConfigProps) => {
	const rarityColor = RARITY_COLORS[config.rarity];

	return size === "small" ? (
		<>
			<article
				className={clsx(
					"border p-2 min-w-40",
					rarityColor.border,
					rarityColor.bg
				)}
			>
				<span className={`text-xs ${rarityColor.text}`}>({config.rarity})</span>
				<h3 className={clsx("text-md", rarityColor.text)}>{config.name}</h3>
			</article>
		</>
	) : (
		<article
			className={clsx(
				"border p-4 w-52 min-h-52",
				rarityColor.border,
				rarityColor.bg,
				disabled && "opacity-50 cursor-not-allowed"
			)}
		>
			<h3 className={clsx("text-2xl", rarityColor.text)}>{config.name}</h3>
			<p>Cost: {formatStorage(config.cost)}</p>
			<p>Refund: {formatStorage(calculateRefund(config.cost))}</p>
			<p>
				Rarity: <span className={rarityColor.text}>{config.rarity}</span>
			</p>
			<p className="border-t border-t-white mt-2 pt-2">{config.description}</p>
		</article>
	);
};

export default ConfigCard;

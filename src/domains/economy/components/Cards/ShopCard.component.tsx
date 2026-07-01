import { clsx } from "clsx";

import ConfigCard from "~/domains/economy/components/Cards/ConfigCard.component";
import { Config } from "~/domains/economy/models/config.model";
import { RARITY_COLORS } from "~/ui/rarityColors";

type ShopConfigProps = {
	config: Config;
	disabled?: boolean;
	isInstalled?: boolean;
	onInstall: (config: Config) => void;
};

const ShopCard = ({
	config,
	disabled,
	isInstalled,
	onInstall,
}: ShopConfigProps) => {
	const rarityColors = RARITY_COLORS[config.rarity];
	const isInteractive = !disabled && !isInstalled;

	const buttonStyles = clsx("border p-2 w-full", {
		"border-green-600 text-green-400 opacity-70 cursor-not-allowed":
			isInstalled,
		"opacity-50 cursor-not-allowed": disabled && !isInstalled,
		[`${rarityColors.border} ${rarityColors.text} cursor-pointer`]:
			isInteractive,
	});

	const buttonLabel = isInstalled
		? "✓ Installed"
		: disabled
			? "Not enough storage"
			: "Install";

	return (
		<div
			className={clsx(
				"flex flex-col gap-2 transition-transform",
				isInteractive && "hover:scale-105 cursor-pointer"
			)}
		>
			<ConfigCard config={config} disabled={!isInteractive} size="large" />
			<button
				onClick={() => isInteractive && onInstall(config)}
				disabled={!isInteractive}
				className={buttonStyles}
			>
				{buttonLabel}
			</button>
		</div>
	);
};

export default ShopCard;

import { clsx } from "clsx";

import { ConfigCard, RARITY_COLORS, type Rarity } from "./ConfigCard.ui";

export type ShopCardProps = {
	name: string;
	cost: string;
	refund: string;
	rarity: Rarity;
	description: string;
	isInstalled?: boolean;
	canAfford?: boolean;
	isShopOpen?: boolean;
	onInstall: () => void;
};

export const ShopCard = ({
	name,
	cost,
	refund,
	rarity,
	description,
	isInstalled = false,
	canAfford = true,
	isShopOpen = true,
	onInstall,
}: ShopCardProps) => {
	const colors = RARITY_COLORS[rarity];
	const isInteractive = !isInstalled && canAfford && isShopOpen;

	const buttonLabel = isInstalled
		? "✓ Installed"
		: !canAfford
			? "Not enough storage"
			: !isShopOpen
				? "Shop closed"
				: "Install";

	return (
		<div
			className={clsx(
				"flex flex-col gap-2 transition-transform",
				isInteractive && "hover:scale-105 cursor-pointer"
			)}
		>
			<ConfigCard
				name={name}
				cost={cost}
				refund={refund}
				rarity={rarity}
				description={description}
				disabled={!isInteractive}
				size="large"
			/>
			<button
				onClick={isInteractive ? onInstall : undefined}
				disabled={!isInteractive}
				className={clsx("border p-2 w-full", {
					"border-green-600 text-green-400 opacity-70 cursor-not-allowed":
						isInstalled,
					"opacity-50 cursor-not-allowed": !isInstalled && !isInteractive,
					[`${colors.border} ${colors.text} cursor-pointer`]: isInteractive,
				})}
			>
				{buttonLabel}
			</button>
		</div>
	);
};

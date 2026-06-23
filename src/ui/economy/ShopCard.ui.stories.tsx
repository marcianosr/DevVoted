import type { Meta, StoryObj } from "@storybook/react";
import { ShopCard } from "./ShopCard.ui";

const meta: Meta<typeof ShopCard> = {
	component: ShopCard,
	title: "Economy/Molecules/Shop Card",
	decorators: [
		(Story) => (
			<div className="flex gap-4 flex-wrap">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof ShopCard>;

const baseConfig = {
	name: "Cache Warmer",
	cost: "64 KB",
	refund: "32 KB",
	rarity: "common" as const,
	description: "Preloads the most frequently accessed poll data into memory.",
	onInstall: () => {},
};

export const Available: Story = {
	args: { ...baseConfig, canAfford: true, isShopOpen: true },
};

export const Installed: Story = {
	args: { ...baseConfig, isInstalled: true },
};

export const CantAfford: Story = {
	args: { ...baseConfig, canAfford: false, isShopOpen: true },
};

export const ShopClosed: Story = {
	args: { ...baseConfig, canAfford: true, isShopOpen: false },
};

export const RarityShowcase: Story = {
	render: () => (
		<div className="flex gap-4 flex-wrap">
			{(["common", "uncommon", "rare", "legendary"] as const).map((rarity) => (
				<ShopCard
					key={rarity}
					name="Mumbo's Magic"
					cost="128 KB"
					refund="64 KB"
					rarity={rarity}
					description={`A ${rarity} config with special powers.`}
					canAfford={true}
					isShopOpen={true}
					onInstall={() => {}}
				/>
			))}
		</div>
	),
};

import type { Meta, StoryObj } from "@storybook/react";
import { ConfigCard } from "./ConfigCard.ui";

const meta: Meta<typeof ConfigCard> = {
	component: ConfigCard,
	title: "Economy/Molecules/Config Card",
};
export default meta;

type Story = StoryObj<typeof ConfigCard>;

export const Common: Story = {
	args: {
		name: "Cache Warmer",
		cost: "64 KB",
		refund: "32 KB",
		rarity: "common",
		description: "Preloads the most frequently accessed poll data into memory.",
	},
};

export const Uncommon: Story = {
	args: {
		name: "Null Coalescer",
		cost: "128 KB",
		refund: "64 KB",
		rarity: "uncommon",
		description: "Converts undefined poll answers into safe defaults.",
	},
};

export const Rare: Story = {
	args: {
		name: "Banjo's Backpack",
		cost: "256 KB",
		refund: "128 KB",
		rarity: "rare",
		description: "Grants +0.5% coverage bonus per correct poll answered.",
	},
};

export const Legendary: Story = {
	args: {
		name: "Kazooie's Wing Whack",
		cost: "512 KB",
		refund: "256 KB",
		rarity: "legendary",
		description:
			"Doubles coverage gain for your next gate window. Legendary power.",
	},
};

export const SmallSize: Story = {
	args: {
		name: "Cache Warmer",
		cost: "64 KB",
		refund: "32 KB",
		rarity: "common",
		description: "Preloads poll data.",
		size: "small",
	},
};

export const Disabled: Story = {
	args: {
		name: "Null Coalescer",
		cost: "128 KB",
		refund: "64 KB",
		rarity: "uncommon",
		description: "Not enough storage to install.",
		disabled: true,
	},
};

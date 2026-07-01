import type { Meta, StoryObj } from "@storybook/react";

import { ConfigCard } from "./ConfigCard.ui";

const meta: Meta<typeof ConfigCard> = {
	component: ConfigCard,
	title: "Economy/ConfigCard",
};
export default meta;

type Story = StoryObj<typeof ConfigCard>;

export const Small: Story = {
	args: {
		name: ".includes",
		rarity: "rare",
		size: "small",
	},
};

export const Large: Story = {
	args: {
		name: "Prettier",
		rarity: "legendary",
		size: "large",
		costLabel: "12 KB",
		refundLabel: "6 KB",
		description: "Reveals how many correct answers you have selected.",
	},
};

export const Disabled: Story = {
	args: {
		...Large.args,
		disabled: true,
	},
};

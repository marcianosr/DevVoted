import type { Meta, StoryObj } from "@storybook/react";

import { BuyLine } from "./BuyLine.ui";

const noop = () => {};

const meta: Meta<typeof BuyLine> = {
	component: BuyLine,
	title: "Terminal/BuyLine",
	decorators: [
		(Story) => (
			<div className="@container w-[600px] bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof BuyLine>;

export const RebuildOffers: Story = {
	args: {
		label: "Rebuild offers",
		icon: "↻",
		price: "16 KB",
		onBuy: noop,
	},
};

export const BuySlot: Story = {
	args: {
		label: "Buy slot 6",
		detail: "The sixth is the last one this plan allows",
		icon: "+",
		price: "16 KB",
		onBuy: noop,
	},
};

export const RebuildRetired: Story = {
	args: {
		label: "Rebuild offers",
		icon: "↻",
		price: "16 KB",
		lock: "Config list exhausted!",
	},
};

export const NothingLeftToBuy: Story = {
	args: {
		label: "Git tag",
		detail: "Tagged at gate 8 · a dead run checks out there",
	},
};

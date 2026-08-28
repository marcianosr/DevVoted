import type { Meta, StoryObj } from "@storybook/react";

import { ShopHeader } from "./ShopHeader.ui";

const meta: Meta<typeof ShopHeader> = {
	component: ShopHeader,
	title: "Modern/ShopHeader",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender">
				<Story />
			</div>
		),
	],
	args: {
		title: "Lavender shop",
		nextGate: "gate 4",
		storage: { balanceKb: 216 },
	},
};
export default meta;

type Story = StoryObj<typeof ShopHeader>;

export const Solvent: Story = {};

export const OverCap: Story = {
	args: {
		storage: { balanceKb: 560 },
	},
};

export const Broke: Story = {
	args: { storage: { balanceKb: 512 } },
};

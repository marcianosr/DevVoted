import type { Meta, StoryObj } from "@storybook/react";

import { ShopHeader } from "./ShopHeader.ui";

// Game-design reason: the shop is the one screen where storage is a budget
// rather than a score, so the cap and what is against it lead the header.
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
		storage: { plan: "Free tier", used: 216, cap: 512 },
	},
};
export default meta;

type Story = StoryObj<typeof ShopHeader>;

export const Solvent: Story = {};

/** Storage carried in above the cap: the warning sits with the figure it is
 * about to shrink. */
export const OverCap: Story = {
	args: {
		storage: { plan: "Free tier", used: 560, cap: 512 },
	},
};

/** Nothing left to spend — every price on the shelf is out of reach. */
export const Broke: Story = {
	args: { storage: { plan: "Free tier", used: 512, cap: 512 } },
};

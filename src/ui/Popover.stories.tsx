import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from "./Popover.component";

const meta: Meta<typeof Popover> = {
	component: Popover,
	title: "Molecules/Popover",
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
	args: {
		ariaLabel: "Show info",
		content: <p>Banjo-Kazooie is a platformer developed by Rare.</p>,
		children: <span>ℹ️</span>,
	},
};

export const WithLongContent: Story = {
	args: {
		ariaLabel: "Show storage info",
		content: (
			<div>
				<p>Storage is used to install configs.</p>
				<p>Each config uses a different amount of storage.</p>
			</div>
		),
		children: <span>💾</span>,
	},
};

import type { Meta, StoryObj } from "@storybook/react";

import { Tooltip } from "./Tooltip.ui";

const meta: Meta<typeof Tooltip> = {
	component: Tooltip,
	title: "Terminal/Tooltip",
	decorators: [
		(Story) => (
			<div className="flex min-h-40 items-center justify-center bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const OnHover: Story = {
	args: {
		hint: "Upgrade .js for 64 KB",
		children: <span className="text-sm text-zinc-200">hover me</span>,
	},
};

export const WithoutAHint: Story = {
	args: {
		children: <span className="text-sm text-zinc-200">nothing to say</span>,
	},
};

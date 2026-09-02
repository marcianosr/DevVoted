import type { Meta, StoryObj } from "@storybook/react";

import { IconButton } from "./IconButton.ui";
import { Tooltip } from "./Tooltip.ui";

const noop = () => {};

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

// The kit's own tooltip replaced the browser's `title`, which drew a slow,
// unstyled bubble in the OS font.
export const OnAnIconButton: Story = {
	render: () => (
		<IconButton
			icon="↑"
			label="Upgrade .js"
			hint="Upgrade .js for 64 KB"
			tone="legendary"
			onUse={noop}
		/>
	),
};

export const WithoutAHint: Story = {
	args: {
		children: <span className="text-sm text-zinc-200">nothing to say</span>,
	},
};

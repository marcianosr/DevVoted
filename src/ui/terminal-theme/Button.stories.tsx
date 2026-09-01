import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button.ui";

const noop = () => {};

const meta: Meta<typeof Button> = {
	component: Button,
	title: "Terminal/Button",
	decorators: [
		(Story) => (
			<div className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
	args: { label: "Resume →", variant: "primary", onUse: noop },
};

export const Quiet: Story = { args: { label: "Review answers", onUse: noop } };

export const Danger: Story = {
	args: { label: "Remove 1 more slot →", variant: "danger", onUse: noop },
};

export const Upgrade: Story = {
	args: { label: "upgrade ↑", variant: "upgrade", size: "sm", onUse: noop },
};

export const Disabled: Story = {
	args: { label: "Pick an answer", disabled: true },
};

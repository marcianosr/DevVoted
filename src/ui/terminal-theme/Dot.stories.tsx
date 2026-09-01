import type { Meta, StoryObj } from "@storybook/react";

import { Dot } from "./Dot.ui";

const meta: Meta<typeof Dot> = {
	component: Dot,
	title: "Terminal/Dot",
	decorators: [
		(Story) => (
			<div className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Dot>;

export const Running: Story = { args: { variant: "on" } };

export const SittingOut: Story = { args: { variant: "off" } };

export const Usable: Story = { args: { variant: "action" } };

export const Blocked: Story = { args: { variant: "blocked" } };

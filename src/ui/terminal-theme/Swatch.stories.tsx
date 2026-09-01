import type { Meta, StoryObj } from "@storybook/react";

import { Swatch } from "./Swatch.ui";

const meta: Meta<typeof Swatch> = {
	component: Swatch,
	title: "Terminal/Swatch",
	decorators: [
		(Story) => (
			<div className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Swatch>;

export const Earned: Story = { args: { theme: "lavender" } };

export const Current: Story = { args: { theme: "lavender", state: "current" } };

export const Locked: Story = { args: { state: "locked" } };

export const Pending: Story = { args: { state: "pending" } };

export const Hero: Story = { args: { theme: "lavender", size: "hero" } };

export const PendingHero: Story = { args: { state: "pending", size: "hero" } };

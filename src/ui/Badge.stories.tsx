import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge.component";

const meta: Meta<typeof Badge> = {
	component: Badge,
	title: "UI/Badge",
	decorators: [
		(Story) => (
			<div className="relative inline-flex rounded-lg border-2 border-zinc-600 px-6 py-3">
				<Story />
				token
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Neutral: Story = { args: { children: "fixed" } };
export const Positive: Story = { args: { children: "new", tone: "positive" } };
export const Price: Story = { args: { children: "60KB", tone: "price" } };

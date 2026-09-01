import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge.ui";

const meta: Meta<typeof Badge> = {
	component: Badge,
	title: "Terminal/Badge",
	decorators: [
		(Story) => (
			<div className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Gain: Story = { args: { tone: "viridian", children: "+160 KB" } };

export const Loss: Story = {
	args: { tone: "cinnabar", children: "remove 2 slots" },
};

export const Faded: Story = { args: { tone: "saffron", children: "faded" } };

export const Category: Story = {
	args: { tone: "celadon", children: "JavaScript" },
};

export const StatChip: Story = {
	args: { tone: "viridian", size: "md", children: "62.4% of 60% needed" },
};

export const Neutral: Story = {
	args: { size: "md", children: "streak 3" },
};

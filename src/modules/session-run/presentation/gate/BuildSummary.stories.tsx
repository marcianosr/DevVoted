import type { Meta, StoryObj } from "@storybook/react";

import { BuildSummary } from "./BuildSummary.ui";

const meta: Meta<typeof BuildSummary> = {
	component: BuildSummary,
	title: "Session Run/BuildSummary",
};
export default meta;

type Story = StoryObj<typeof BuildSummary>;

export const Bare: Story = {
	args: { demands: ["1 correct answer"], rewardMultiplier: 1 },
};

export const Stacked: Story = {
	args: {
		demands: ["1 correct answer", "2 fast answers", "+4% coverage this window"],
		rewardMultiplier: 3,
	},
};

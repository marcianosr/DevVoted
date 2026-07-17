import type { Meta, StoryObj } from "@storybook/react";

import { MultiplierSummary } from "./MultiplierSummary.ui";

const meta: Meta<typeof MultiplierSummary> = {
	component: MultiplierSummary,
	title: "Session Run/MultiplierSummary",
};
export default meta;

type Story = StoryObj<typeof MultiplierSummary>;

export const Baseline: Story = {
	args: { rewardMultiplier: 1, coverageMultiplier: 1, coverageAdd: 0 },
};

export const Boosted: Story = {
	args: { rewardMultiplier: 1.5, coverageMultiplier: 2, coverageAdd: 0 },
};

export const WithCoverageAdd: Story = {
	args: { rewardMultiplier: 3, coverageMultiplier: 2, coverageAdd: 0.5 },
};

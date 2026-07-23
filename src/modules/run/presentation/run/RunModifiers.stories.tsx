import type { Meta, StoryObj } from "@storybook/react";

import { RunModifiers } from "./RunModifiers.ui";

const meta: Meta<typeof RunModifiers> = {
	component: RunModifiers,
	title: "Run/RunModifiers",
};
export default meta;

type Story = StoryObj<typeof RunModifiers>;

export const Default: Story = {
	args: { rewardMultiplier: 1, coverageMultiplier: 1, coverageAdd: 0 },
};

export const Boosted: Story = {
	args: { rewardMultiplier: 3, coverageMultiplier: 2, coverageAdd: 15 },
};

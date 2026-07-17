import type { Meta, StoryObj } from "@storybook/react";

import { RunStakes } from "./RunStakes.ui";

const meta: Meta<typeof RunStakes> = {
	component: RunStakes,
	title: "Run/RunStakes",
};
export default meta;

type Story = StoryObj<typeof RunStakes>;

export const Default: Story = {
	args: { gateReward: 180 },
};

export const DeepGateReward: Story = {
	args: { gateReward: 640 },
};

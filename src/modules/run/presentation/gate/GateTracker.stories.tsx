import type { Meta, StoryObj } from "@storybook/react";

import { GateTracker } from "./GateTracker.ui";

const meta: Meta<typeof GateTracker> = {
	component: GateTracker,
	title: "Run/GateTracker",
};
export default meta;

type Story = StoryObj<typeof GateTracker>;

export const MidClimb: Story = { args: { total: 5, cleared: 2 } };
export const Fresh: Story = { args: { total: 5, cleared: 0 } };
export const AlmostThere: Story = { args: { total: 5, cleared: 4 } };

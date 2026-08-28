import type { Meta, StoryObj } from "@storybook/react";

import { StorageGauge } from "~/modules/run/run/presentation/StorageGauge.ui";

const meta: Meta<typeof StorageGauge> = {
	component: StorageGauge,
	title: "Run/StorageGauge",
};
export default meta;

type Story = StoryObj<typeof StorageGauge>;

export const Empty: Story = { args: { usedKb: 0 } };

export const MidRun: Story = { args: { usedKb: 184 } };

export const Rich: Story = { args: { usedKb: 2048 } };

export const Wide: Story = { args: { usedKb: 184, layout: "wide" } };

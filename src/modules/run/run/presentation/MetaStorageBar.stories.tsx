import type { Meta, StoryObj } from "@storybook/react";

import { MetaStorageBar } from "./MetaStorageBar.ui";

const meta: Meta<typeof MetaStorageBar> = {
	component: MetaStorageBar,
	title: "Runs/MetaStorageBar",
};
export default meta;

type Story = StoryObj<typeof MetaStorageBar>;

export const PartlyCarried: Story = {
	args: { carriedKb: 41, totalKb: 137 },
};

export const FullyCarried: Story = {
	args: { carriedKb: 640, totalKb: 640 },
};

export const NothingCarried: Story = {
	args: { carriedKb: 0, totalKb: 96 },
};

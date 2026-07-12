import type { Meta, StoryObj } from "@storybook/react";

import { RarityLegend } from "./RarityLegend.ui";

const meta: Meta<typeof RarityLegend> = {
	component: RarityLegend,
	title: "Session Run/RarityLegend",
};
export default meta;

type Story = StoryObj<typeof RarityLegend>;

export const Default: Story = {};

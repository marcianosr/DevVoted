import type { Meta, StoryObj } from "@storybook/react";

import { Subtitle } from "./Subtitle.component";

const meta: Meta<typeof Subtitle> = {
	component: Subtitle,
	title: "Design System/Typography/Subtitle",
};
export default meta;

type Story = StoryObj<typeof Subtitle>;

export const Default: Story = {
	args: { children: "Stack configs to make your gate richer — and harder." },
};

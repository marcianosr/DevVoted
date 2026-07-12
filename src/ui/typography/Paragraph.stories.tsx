import type { Meta, StoryObj } from "@storybook/react";

import { Paragraph } from "./Paragraph.component";

const meta: Meta<typeof Paragraph> = {
	component: Paragraph,
	title: "Design System/Typography/Paragraph",
};
export default meta;

type Story = StoryObj<typeof Paragraph>;

export const Default: Story = {
	args: {
		children:
			"Answer polls to clear the gate. Miss it and you peel a config off your board.",
	},
};

import type { Meta, StoryObj } from "@storybook/react";

import { EmptyMessageLine } from "./EmptyMessageLine.component";

const meta: Meta<typeof EmptyMessageLine> = {
	component: EmptyMessageLine,
	title: "UI/EmptyMessageLine",
};
export default meta;

type Story = StoryObj<typeof EmptyMessageLine>;

export const Default: Story = {
	args: {
		children: "No installed config affects this poll",
	},
};

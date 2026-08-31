import type { Meta, StoryObj } from "@storybook/react";

import { StepHeading } from "~/modules/run/run/presentation/StepHeading.ui";

const meta: Meta<typeof StepHeading> = {
	component: StepHeading,
	title: "Run/Screens/StepHeading",
};
export default meta;

type Story = StoryObj<typeof StepHeading>;

export const Default: Story = {
	args: { step: 1, title: "Draft your configs" },
};

export const WithSubtitle: Story = {
	args: {
		step: 1,
		title: "Draft your configs",
		subtitle: "Pick the pieces your build runs at every gate",
	},
};

export const ViridianTone: Story = {
	args: {
		step: 2,
		title: "Assemble the build",
		subtitle: "Order matters — checks run top to bottom",
		tone: "viridian",
	},
};

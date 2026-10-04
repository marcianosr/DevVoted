import type { Meta, StoryObj } from "@storybook/react";

import { Accuracy } from "./Accuracy.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof Accuracy> = {
	component: Accuracy,
	title: "Kanto/Accuracy",
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<Accuracy {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Accuracy>;

export const Ahead: Story = {
	args: {
		track: {
			label: "Accuracy ×1.09, up to ×1.83",
			figure: "×1.09 · up to ×1.83",
			sure: 0.09,
			best: 0.83,
		},
	},
};

export const Landed: Story = {
	args: {
		landed: true,
		track: { label: "Accuracy ×1.08", figure: "×1.08", sure: 0.08, best: 0.08 },
	},
};

import type { Meta, StoryObj } from "@storybook/react";

import { AccuracyTrack } from "./AccuracyTrack.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof AccuracyTrack> = {
	component: AccuracyTrack,
	title: "Kanto/AccuracyTrack",
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<AccuracyTrack {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof AccuracyTrack>;

export const Empty: Story = {
	args: {
		label: "Accuracy ×1, up to ×2",
		figure: "×1 · up to ×2",
		sure: 0,
		best: 1,
	},
};

export const AfterAMiss: Story = {
	args: {
		label: "Accuracy ×1.09, up to ×1.83",
		figure: "×1.09 · up to ×1.83",
		sure: 0.09,
		best: 0.83,
	},
};

export const AllRight: Story = {
	args: {
		label: "Accuracy ×2",
		figure: "×2",
		sure: 1,
		best: 1,
		pulse: { key: "last" },
	},
};

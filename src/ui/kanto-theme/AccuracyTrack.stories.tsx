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

const tickedFrom = (from: number) =>
	[0, 1, 2, 3, 4, 5].map((step) => ({
		share: step / 5,
		...(step === 5 ? {} : { label: `×${(from + step * 0.05).toFixed(2)}` }),
	}));

export const FirstGate: Story = {
	args: {
		label: "Accuracy ×1, this gate up to ×1.08",
		figure: "×1",
		bonus: 0,
		cap: 0.32,
		ticks: tickedFrom(1),
	},
};

export const MidGate: Story = {
	args: {
		label: "Accuracy ×1.13, this gate up to ×1.18",
		figure: "×1.13",
		bonus: 0.52,
		cap: 0.72,
		ticks: tickedFrom(1),
	},
};

export const AtTheCap: Story = {
	args: {
		label: "Accuracy ×1.15",
		figure: "×1.15",
		bonus: 0.6,
		cap: 0.6,
		ticks: tickedFrom(1),
		pulse: { key: "last" },
	},
};

export const LateRun: Story = {
	args: {
		label: "Accuracy ×1.9, this gate up to ×1.95",
		figure: "×1.9",
		bonus: 0.2,
		cap: 0.4,
		ticks: tickedFrom(1.85),
	},
};

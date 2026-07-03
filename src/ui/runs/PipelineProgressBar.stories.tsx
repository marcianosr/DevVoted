import type { Meta, StoryObj } from "@storybook/react";

import { PipelineProgressBar } from "./PipelineProgressBar.ui";

const meta: Meta<typeof PipelineProgressBar> = {
	component: PipelineProgressBar,
	title: "Runs/PipelineProgressBar",
	decorators: [
		(Story) => (
			<div data-category-theme="html" className="w-96 p-4 bg-black">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof PipelineProgressBar>;

export const Gained: Story = {
	args: {
		previous: 1,
		current: 4,
		target: 5,
		suffix: "answered",
	},
};

export const CoverageGain: Story = {
	args: {
		previous: 0,
		current: 0.7,
		target: 3,
		suffix: "%",
	},
};

export const Lost: Story = {
	args: {
		previous: 3,
		current: 2,
		target: 5,
		suffix: "correct",
	},
};

export const Static: Story = {
	args: {
		previous: 2,
		current: 2,
		target: 3,
		suffix: "correct",
	},
};

export const NotSeen: Story = {
	args: {
		previous: 0,
		current: 0,
		target: 2,
		suffix: "correct",
		seen: false,
	},
};

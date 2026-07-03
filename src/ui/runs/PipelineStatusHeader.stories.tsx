import type { Meta, StoryObj } from "@storybook/react";

import { PipelineStatusHeader } from "./PipelineStatusHeader.ui";

const meta: Meta<typeof PipelineStatusHeader> = {
	component: PipelineStatusHeader,
	title: "Runs/PipelineStatusHeader",
	decorators: [
		(Story) => (
			<div data-category-theme="html" className="max-w-4xl p-4 bg-black">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof PipelineStatusHeader>;

export const Default: Story = {
	args: { gate: 1, pollsLeft: 3 },
};

export const OnePollLeft: Story = {
	args: { gate: 4, pollsLeft: 1 },
};

export const NoWindowContext: Story = {
	args: {},
};

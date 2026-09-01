import type { Meta, StoryObj } from "@storybook/react";

import { Meter } from "./Meter.ui";

const meta: Meta<typeof Meter> = {
	component: Meter,
	title: "Terminal/Meter",
	decorators: [
		(Story) => (
			<div data-swatch-theme="lavender" className="w-64 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Meter>;

export const Coverage: Story = {
	args: { percent: 46, label: "coverage" },
};

export const NearlyDrained: Story = {
	args: { percent: 12, label: "storage this run" },
};

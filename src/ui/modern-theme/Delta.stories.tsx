import type { Meta, StoryObj } from "@storybook/react";

import { Delta } from "./Delta.ui";

const meta: Meta<typeof Delta> = {
	component: Delta,
	title: "Modern/Delta",
};
export default meta;

type Story = StoryObj<typeof Delta>;

export const Gain: Story = { args: { kb: 16 } };
export const Cost: Story = { args: { kb: -128 } };
export const Flat: Story = { args: { kb: 0 } };
export const Coverage: Story = { args: { coverage: 2.6 } };
export const Multiplier: Story = { args: { multiplier: 1.5 } };
export const Percent: Story = { args: { percent: 2 } };

export const Together: Story = {
	render: () => (
		<div className="flex flex-col items-end gap-1">
			<Delta multiplier={1.5} />
			<Delta multiplier={2} />
			<Delta kb={-16} />
			<Delta kb={16} />
			<Delta coverage={2.6} />
			<Delta coverage={-1.4} />
			<Delta percent={2} />
		</div>
	),
};

import type { Meta, StoryObj } from "@storybook/react";

import { Coverage } from "./Coverage.ui";

const meta: Meta<typeof Coverage> = {
	component: Coverage,
	title: "Modern/Coverage",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="w-80">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Coverage>;

export const ShortOfTheDemand: Story = {
	args: { held: 38.6, projected: 23.1, required: 60 },
};

export const Clearing: Story = {
	args: { held: 52, projected: 19.4, required: 60 },
};

export const Closed: Story = {
	args: { held: 38.6, projected: 23.1, required: 60, defaultOpen: false },
};

export const FirstGate: Story = {
	args: { held: 0, projected: 12.5, required: 20 },
};

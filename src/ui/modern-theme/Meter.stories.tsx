import type { Meta, StoryObj } from "@storybook/react";

import { Meter } from "./Meter.ui";

const meta: Meta<typeof Meter> = {
	component: Meter,
	title: "Modern/Meter",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="w-72">
				<Story />
			</div>
		),
	],
	args: { max: 100, label: "Coverage" },
};
export default meta;

type Story = StoryObj<typeof Meter>;

export const HeldAndProjected: Story = {
	args: { held: 38.6, projected: 23.1 },
};

export const NothingProjected: Story = { args: { held: 38.6 } };

export const Empty: Story = { args: { held: 0, projected: 0 } };

export const Overshooting: Story = { args: { held: 80, projected: 40 } };

export const Full: Story = { args: { held: 100 } };

import type { Meta, StoryObj } from "@storybook/react";

import { Meter } from "./Meter.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof Meter> = {
	component: Meter,
	title: "Kanto/Meter",
	render: (args) => (
		<Screen gate="lavender" width="narrow">
			<Meter {...args} />
		</Screen>
	),
	args: { value: 0, max: 60 },
};
export default meta;

type Story = StoryObj<typeof Meter>;

export const Empty: Story = {};

export const PartWay: Story = { args: { value: 24, max: 60 } };

export const Met: Story = { args: { value: 60, max: 60 } };

export const Spilled: Story = { args: { value: 92.5, max: 60 } };

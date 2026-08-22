import type { Meta, StoryObj } from "@storybook/react";

import { Slot } from "./Slot.ui";

// Game-design reason: pipeline width is what a build is planned around, so the
// slots you have not filled have to be as visible as the ones you have.
const meta: Meta<typeof Slot> = {
	component: Slot,
	title: "Modern/Slot",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="w-80 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Slot>;

export const Open: Story = {};

export const NotYetOwned: Story = { args: { gate: 4 } };

export const AWholePipeline: Story = {
	render: () => (
		<ul>
			{[0, 1, 2, 3, 4, 5].map((slot) => (
				<li key={slot}>
					<Slot />
				</li>
			))}
			<li>
				<Slot gate={4} />
			</li>
		</ul>
	),
};

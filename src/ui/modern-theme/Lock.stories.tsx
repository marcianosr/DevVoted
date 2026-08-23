import type { Meta, StoryObj } from "@storybook/react";

import { Lock } from "./Lock.ui";

const meta: Meta<typeof Lock> = {
	component: Lock,
	title: "Modern/Lock",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Lock>;

export const Unlocked: Story = {
	args: {
		on: "Stylelint",
		state: "unlocked",
		cost: "16 KB",
		onToggle: () => {},
	},
};

export const Held: Story = {
	args: { on: "Freemium", state: "locked", onToggle: () => {} },
};

export const Unavailable: Story = {
	args: { on: "WTFPL", state: "unavailable" },
};

import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge.ui";
import { Choice } from "./Choice.ui";

const noop = () => {};

const meta: Meta<typeof Choice> = {
	component: Choice,
	title: "Terminal/Choice",
	decorators: [
		(Story) => (
			<div className="w-[600px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Choice>;

export const Pickable: Story = {
	args: { letter: "A", label: "at(−1)", onPick: noop },
};

export const Expected: Story = {
	args: {
		letter: "A",
		label: "at(−1)",
		state: "expected",
		note: <Badge tone="viridian">expected · you picked</Badge>,
	},
};

export const Dimmed: Story = {
	args: { letter: "B", label: "pop()", state: "dimmed" },
};

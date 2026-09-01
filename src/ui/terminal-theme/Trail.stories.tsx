import type { Meta, StoryObj } from "@storybook/react";

import { Trail } from "./Trail.ui";

const meta: Meta<typeof Trail> = {
	component: Trail,
	title: "Terminal/Trail",
	decorators: [
		(Story) => (
			<div className="w-[500px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Trail>;

export const SecondPoll: Story = {
	args: { count: 5, current: 2, label: "poll 2 of 5" },
};

export const LastPoll: Story = {
	args: { count: 5, current: 5, label: "poll 5 of 5" },
};

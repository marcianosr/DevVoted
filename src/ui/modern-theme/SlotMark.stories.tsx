import type { Meta, StoryObj } from "@storybook/react";

import { SlotMark } from "./SlotMark.ui";

const meta = {
	title: "Modern/SlotMark",
	component: SlotMark,
} satisfies Meta<typeof SlotMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const One: Story = { args: { slots: 1 } };

export const Ladder: Story = {
	args: { slots: 4 },
	render: () => (
		<div className="flex flex-col gap-2">
			{[1, 2, 4, 8, 12, 16].map((slots) => (
				<SlotMark key={slots} slots={slots} />
			))}
		</div>
	),
};

export const WithHint: Story = {
	args: { slots: 8, hint: "takes 8 of your 12 slots" },
};

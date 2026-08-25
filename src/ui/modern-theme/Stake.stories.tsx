import type { Meta, StoryObj } from "@storybook/react";

import { Stake } from "./Stake.ui";

const meta = {
	title: "Modern/Stake",
	component: Stake,
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="w-80">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Stake>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Survivable: Story = {
	args: { removeOnMiss: 1, coveragePerWrong: -0.3 },
};

export const Deeper: Story = {
	args: { removeOnMiss: 2, coveragePerWrong: -1.3 },
};

/** The peel takes the whole build, so the row says what the count amounts to. */
export const Fatal: Story = {
	args: { removeOnMiss: 3, coveragePerWrong: -2.5, missIsFatal: true },
};

import type { Meta, StoryObj } from "@storybook/react";

import { RunJeopardy } from "./RunJeopardy.ui";

const meta: Meta<typeof RunJeopardy> = {
	component: RunJeopardy,
	title: "Runs/RunJeopardy",
	decorators: [
		(Story) => (
			<div data-category-theme="ts" className="max-w-2xl p-4 bg-black">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof RunJeopardy>;

export const GateImminent: Story = {
	args: {
		gate: 2,
		pollsUntilGate: 1,
		checkCount: 3,
		topStreak: { categoryName: "TypeScript", streak: 5 },
		countdownLabel: "Next poll in 7h 59m 28s",
	},
};

export const MidWindow: Story = {
	args: {
		gate: 3,
		pollsUntilGate: 4,
		checkCount: 2,
		topStreak: { categoryName: "React", streak: 3 },
		countdownLabel: "Next poll in 2h 14m 03s",
	},
};

export const NoStreak: Story = {
	args: {
		gate: 1,
		pollsUntilGate: 5,
		checkCount: 2,
		topStreak: null,
		countdownLabel: "Next poll in 11h 02m 47s",
	},
};

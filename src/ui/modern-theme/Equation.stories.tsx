import type { Meta, StoryObj } from "@storybook/react";

import { Equation } from "./Equation.ui";

const meta: Meta<typeof Equation> = {
	component: Equation,
	title: "Modern/Equation",
	decorators: [
		(Story) => (
			<div data-gate-theme="volcano" className="max-w-2xl p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Equation>;

export const Correct: Story = {
	args: {
		factors: [
			{ label: "correct", value: 1 },
			{ label: "streak", value: 1.2 },
			{ label: ".ts", value: 1.25, chosen: true },
			{ label: "AGENTS.md", value: 2, chosen: true },
		],
		paid: 2.9,
	},
};

export const DeepGate: Story = {
	args: {
		factors: [
			{ label: "correct", value: 6 },
			{ label: "streak", value: 1.5 },
			{ label: "Intellisense", value: 1.5, chosen: true },
			{ label: "Code Coverage", value: 1.5, chosen: true },
		],
		paid: 20.3,
	},
};

export const Miss: Story = {
	args: { factors: [], paid: -0.8 },
};

/** A miss that also cost a streak states the second loss under the first. */
export const MissWithAStreakLost: Story = {
	args: {
		factors: [
			{ label: "wrong", value: 0.5 },
			{ label: "gate 1", value: 1 },
		],
		paid: -0.5,
		note: "streak lost · your next correct answer starts at ×1.0",
	},
};

export const Partial: Story = {
	args: {
		factors: [
			{ label: "partial", value: 0.67 },
			{ label: ".js", value: 1.25, chosen: true },
		],
		paid: 0.8,
	},
};

export const WithAFlatAdd: Story = {
	args: {
		factors: [
			{ label: "correct", value: 1 },
			{ label: "Code Coverage", value: 0.5, op: "plus", chosen: true },
			{ label: ".js", value: 1.25, chosen: true },
			{ label: "streak", value: 1.1 },
		],
		paid: 2.1,
	},
};

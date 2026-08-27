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

// The reveal's multiplication: the base names the outcome, and every
// contributing config gets its own chip, dressed in its rarity.
export const Correct: Story = {
	args: {
		factors: [
			{ label: "correct", value: 1 },
			{ label: "streak", value: 1.2 },
			{ label: ".ts", value: 1.25, rarity: "common" },
			{ label: "AGENTS.md", value: 2, rarity: "rare" },
		],
		paid: 2.9,
	},
};

export const DeepGate: Story = {
	args: {
		factors: [
			{ label: "correct", value: 6 },
			{ label: "streak", value: 1.5 },
			{ label: "Intellisense", value: 1.5, rarity: "rare" },
			{ label: "Code Coverage", value: 1.5, rarity: "uncommon" },
		],
		paid: 20.3,
	},
};

// A miss multiplies nothing: the paid line carries the loss alone.
export const Miss: Story = {
	args: { factors: [], paid: -0.8 },
};

export const Partial: Story = {
	args: {
		factors: [
			{ label: "partial", value: 0.67 },
			{ label: ".js", value: 1.25, rarity: "common" },
		],
		paid: 0.8,
	},
};

// A flat-add config joins with a +, carrying what it contributed rather than
// the factor it multiplies out to; the brackets say the multipliers scale the
// sum, not the base alone.
export const WithAFlatAdd: Story = {
	args: {
		factors: [
			{ label: "correct", value: 1 },
			{ label: "Code Coverage", value: 0.5, op: "plus", rarity: "uncommon" },
			{ label: ".js", value: 1.25, rarity: "common" },
			{ label: "streak", value: 1.1 },
		],
		paid: 2.1,
	},
};

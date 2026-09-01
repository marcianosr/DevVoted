import type { Meta, StoryObj } from "@storybook/react";

import { Equation } from "./Equation.ui";

const meta: Meta<typeof Equation> = {
	component: Equation,
	title: "Terminal/Equation",
	decorators: [
		(Story) => (
			<div className="w-[600px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Equation>;

export const ScoreReveal: Story = {
	args: {
		factors: [
			{ value: "1.0", label: "correct" },
			{ value: "1.1", label: "streak" },
			{ value: "3.1", label: "build", boxed: true },
		],
		result: "+3.1%",
		resultLabel: "coverage earned",
	},
};

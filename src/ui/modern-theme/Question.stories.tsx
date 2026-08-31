import type { Meta, StoryObj } from "@storybook/react";

import { Token } from "./Code.ui";
import { Question } from "./Question.ui";

const meta: Meta<typeof Question> = {
	component: Question,
	title: "Modern/Question",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="max-w-2xl">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Question>;

export const WithMeta: Story = {
	args: {
		children: (
			<>
				{"Don't ask me why these polls all rhyme — to lift the final two from "}
				<Token tone="theme">arr</Token>
				{
					" in TypeScript time, which line returns them, and leaves the source sublime?"
				}
			</>
		),
		meta: [
			{ label: "lift-the-final-two" },
			{ label: "typescript" },
			{ label: "scores", figure: "×1.1", tone: "celadon" },
			{ label: "@matthijsgroen" },
		],
	},
};

/** The facts line as a gate states it: what the poll pays, then what it costs. */
export const WithTheStake: Story = {
	args: {
		children: "typeof null === ?",
		category: { label: "JavaScript" },
		meta: [
			{ label: "scores", figure: "×1", tone: "celadon" },
			{ label: "3 options" },
			{ label: "wrong costs", figure: "0.5", tone: "cinnabar" },
			{
				label: "Gate retry cost:",
				figure: "Remove 1 config",
				tone: "cinnabar",
			},
		],
	},
};

export const WithoutMeta: Story = {
	args: { children: "Which line returns the final two entries?" },
};

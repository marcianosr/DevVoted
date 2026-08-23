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
		meta: ["lift-the-final-two", "typescript", "×1.1", "@matthijsgroen"],
	},
};

export const WithoutMeta: Story = {
	args: { children: "Which line returns the final two entries?" },
};

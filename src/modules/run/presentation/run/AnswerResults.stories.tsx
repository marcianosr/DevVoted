import type { Meta, StoryObj } from "@storybook/react";

import { AnswerResults } from "./AnswerResults.ui";

const meta: Meta<typeof AnswerResults> = {
	component: AnswerResults,
	title: "Run/AnswerResults",
};
export default meta;

type Story = StoryObj<typeof AnswerResults>;

export const Default: Story = {
	args: {
		answered: [
			{
				id: "js1",
				question: "Which method returns the last element of an array?",
				category: "js",
				outcome: "correct",
				picked: ["at(-1)"],
			},
			{
				id: "css1",
				question: "Which centers a flex item on both axes?",
				category: "css",
				outcome: "wrong",
				picked: ["align: middle"],
			},
			{
				id: "react1",
				question: "What key should list items get?",
				category: "react",
				outcome: "correct",
				picked: ["A stable unique id"],
			},
			{
				id: "ts1",
				question: "Which are TS utility types?",
				category: "ts",
				outcome: "partial",
				picked: ["Partial", "Banjo"],
			},
		],
	},
};

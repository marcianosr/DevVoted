import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { PollCard } from "./PollCard.ui";

const meta: Meta<typeof PollCard> = {
	component: PollCard,
	title: "Session Run/PollCard",
};
export default meta;

type Story = StoryObj<typeof PollCard>;

const options = [
	{ id: "a", label: "A stable unique id" },
	{ id: "b", label: "The array index, always" },
	{ id: "c", label: "Math.random()" },
];

export const SingleChoice: Story = {
	args: {
		category: "react",
		question: "What is the correct key to give list items in React?",
		options,
		onSelect: () => {},
	},
};

export const MultipleChoice: Story = {
	args: {
		category: "ts",
		question: "Which of these are TypeScript utility types?",
		options,
		selectedOptionIds: ["a"],
		onSelect: () => {},
	},
};

export const WithLinter: Story = {
	args: {
		category: "js",
		question: "Which coerces to true?",
		options,
		disabledOptionIds: ["c"],
		onSelect: () => {},
		canLint: true,
		linter: CONFIGS.eslint,
		onLint: () => {},
		lintCost: 40,
	},
};

export const Revealed: Story = {
	args: {
		category: "react",
		question: "What is the correct key to give list items in React?",
		options,
		onSelect: () => {},
		correctOptionIds: ["a"],
		chosenOptionIds: ["b"],
	},
};

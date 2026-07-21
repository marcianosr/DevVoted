import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { PollCard } from "./PollCard.ui";

const meta: Meta<typeof PollCard> = {
	component: PollCard,
	title: "Run/PollCard",
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
		answerType: "single",
		options,
		onSelect: () => {},
	},
};

export const MultipleChoice: Story = {
	args: {
		category: "ts",
		question: "Which of these are TypeScript utility types?",
		answerType: "multiple",
		options,
		selectedOptionIds: ["a"],
		onSelect: () => {},
	},
};

export const WithLinter: Story = {
	args: {
		category: "js",
		question: "Which coerces to true?",
		answerType: "single",
		options,
		disabledOptionIds: ["c"],
		onSelect: () => {},
		canLint: true,
		linter: CONFIGS.eslint,
		onLint: () => {},
		lintCost: 40,
	},
};

export const WithCodeExample: Story = {
	args: {
		category: "js",
		question:
			"What does this log?\n\n```js\nconst nums = [1, 2, 3];\nconsole.log(nums.map((n) => n * 2));\n```",
		answerType: "single",
		options: [
			{ id: "a", label: "[2, 4, 6]" },
			{ id: "b", label: "[1, 2, 3]" },
			{ id: "c", label: "undefined" },
		],
		onSelect: () => {},
	},
};

export const Revealed: Story = {
	args: {
		category: "react",
		question: "What is the correct key to give list items in React?",
		answerType: "single",
		options,
		onSelect: () => {},
		correctOptionIds: ["a"],
		chosenOptionIds: ["b"],
	},
};

/**
 * The scored reveal: each option's ✓/✕ badge pops in top→bottom (staggered)
 * so the player feels the game tallying their answer. Reload the story to
 * replay the animation.
 */
export const RevealedMultiple: Story = {
	args: {
		category: "js",
		question: "Which of these are valid ways to make a fetch cancellable?",
		answerType: "multiple",
		options: [
			{ id: "a", label: "AbortController + signal" },
			{ id: "b", label: "Cancel via a race with a timeout promise" },
			{ id: "c", label: "Setting fetch's timeout: property" },
			{ id: "d", label: "Ignoring the response if a newer request started" },
			{ id: "e", label: "Wrapping fetch in a cancellable promise library" },
		],
		onSelect: () => {},
		correctOptionIds: ["a", "b", "d", "e"],
		chosenOptionIds: ["a", "c", "d"],
	},
};
